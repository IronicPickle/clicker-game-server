cd ./local
curl -o ./deno-lambda-layer.zip -O -J -L https://github.com/hayd/deno-lambda/releases/download/1.25.2/deno-lambda-layer.zip
unzip deno-lambda-layer.zip -d ./deno-lambda-layer
rm ./deno-lambda-layer.zip