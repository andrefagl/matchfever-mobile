import { join } from "path";
import { tmpdir } from "os";

const getTmpDirectory = (): string => tmpdir();

export { getTmpDirectory };
export const getBuildRunCacheDirectoryPath = (): string =>
    join(getTmpDirectory(), "github-build-cache-provider", "build-run-cache");
