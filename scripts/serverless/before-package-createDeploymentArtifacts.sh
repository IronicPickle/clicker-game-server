DENO_DIR=.deno_dir deno cache api/sessions.ts && cp -R ".deno_dir/gen/file/$PWD/" ".deno_dir/LAMBDA_TASK_ROOT"