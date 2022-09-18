DENO_DIR=.deno_dir deno cache src/api/session.ts && \
  cp -R ".deno_dir/gen/file/$PWD/" ".deno_dir/LAMBDA_TASK_ROOT"