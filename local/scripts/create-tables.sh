aws dynamodb create-table --table-name sessions \
  --attribute-definitions '[
    {
      "AttributeName": "id",
      "AttributeType": "S"
    }
  ]' \
  --key-schema '[
    {
      "AttributeName": "id",
      "KeyType": "HASH"
    }
  ]' \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000

aws dynamodb create-table --table-name gameData \
  --attribute-definitions '[
    {
      "AttributeName": "id",
      "AttributeType": "S"
    },
    {
      "AttributeName": "sessionId",
      "AttributeType": "S"
    }
  ]' \
  --key-schema '[
    {
      "AttributeName": "id",
      "KeyType": "HASH"
    }
  ]' \
  --global-secondary-indexes '[
    { 
      "IndexName": "sessionIndex", 
      "KeySchema": [
        {
          "AttributeName": "sessionId",
          "KeyType": "HASH"
        }
      ],
      "Projection": {
        "ProjectionType": "ALL"
      }
    }
  ]' \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000