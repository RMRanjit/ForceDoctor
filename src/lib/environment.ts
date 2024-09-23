export async function getAppName() {
  const AppName = await process.env.NEXT_APP_NAME;
  // console.log("Environment.ts: AppName", AppName);
  return AppName ? AppName : "Dr. Force";
}
