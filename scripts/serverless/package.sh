DENO_DIR=.deno_dir deno cache src/api/session.ts && \
  cp -R ".deno_dir/gen/file/$PWD/../" ".deno_dir/LAMBDA_TASK_ROOT"
  
rm .serverless/session-service.zip
mkdir .temp
cp -r ../clicker-game-shared/ .temp/
mkdir .temp/clicker-game-server
cp -r src .temp/clicker-game-server/src
cp -r .deno_dir .temp/clicker-game-server/.deno_dir
cd .temp
zip -r ../.serverless/session-service.zip .
cd ..
rm -rf .temp