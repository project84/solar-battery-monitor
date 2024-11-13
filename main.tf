provider "docker" {}

resource "docker_image" "nginx" {
  name         = "nginx"
  keep_locally = false
}

resource "docker_container" "nginx" {
  image = docker_image.nginx.image_id
  name  = "deploy"

  ports {
    internal = 80
    external = 8000
  }
}

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "solar-battery-functions"
}

resource "aws_s3_bucket_ownership_controls" "lambda_bucket" {
  bucket = aws_s3_bucket.lambda_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "lambda_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.lambda_bucket]

  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}

data "archive_file" "lambda_monitor_alerts" {
  type = "zip"

  source_dir  = "${path.module}/dist"
  output_path = "${path.module}/bundle/monitor-alerts.zip"
}

resource "aws_s3_object" "lambda_monitor_alerts" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "lambda_monitor_alerts.zip"
  source = data.archive_file.lambda_monitor_alerts.output_path

  etag = filemd5(data.archive_file.lambda_monitor_alerts.output_path)
}

resource "aws_lambda_function" "monitor_alerts" {
  function_name = "monitor_alerts"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.lambda_monitor_alerts.key

  runtime = "nodejs20.x"
  handler = "monitor-alerts.handler"

  source_code_hash = data.archive_file.lambda_monitor_alerts.output_base64sha256

  role = aws_iam_role.lambda_exec.arn
}

resource "aws_cloudwatch_log_group" "monitor_alerts" {
  name = "/aws/lambda/${aws_lambda_function.monitor_alerts.function_name}"

  retention_in_days = 30
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


provider "aws" {
  region                   = "eu-west-1"
}