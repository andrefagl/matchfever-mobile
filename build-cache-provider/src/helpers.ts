import envPaths from "env-paths";
import { join } from "path";

const { temp: TEMP_PATH } = envPaths("github-build-cache-provider");

export const getTmpDirectory = (): string => TEMP_PATH;
export const getBuildRunCacheDirectoryPath = (): string =>
    join(getTmpDirectory(), "build-run-cache");
