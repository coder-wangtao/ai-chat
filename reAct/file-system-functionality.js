import * as fs from 'fs';
import * as path from 'path';

// Base directory for all file system operations
const BASE_DIR = path.join(process.cwd(), 'code');

// Ensure the base directory exists
function ensureBaseDir() {
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }
}

// Validate that a path is within the allowed directory
function validatePath(filePath) {
  const normalizedPath = path.normalize(filePath);
  const fullPath = path.resolve(BASE_DIR, normalizedPath);
  const baseDirResolved = path.resolve(BASE_DIR);

  if (!fullPath.startsWith(baseDirResolved)) {
    throw new Error(
      `Access denied: Path "${filePath}" is outside the allowed directory`,
    );
  }

  return fullPath;
}

// Get relative path from base directory
function getRelativePath(fullPath) {
  const baseDirResolved = path.resolve(BASE_DIR);
  return path.relative(baseDirResolved, fullPath);
}

/**
 * Write content to a file
 */
export function writeFile(filePath, content) {
  try {
    ensureBaseDir();
    const fullPath = validatePath(filePath);

    // Ensure the directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf8');

    return {
      success: true,
      message: `File written successfully: ${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    return {
      success: false,
      message: `Error writing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      path: filePath,
    };
  }
}

/**
 * Read content from a file
 */
export function readFile(filePath) {
  try {
    ensureBaseDir();
    const fullPath = validatePath(filePath);

    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        message: `File not found: ${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    return {
      success: true,
      content,
      message: `File read successfully: ${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    return {
      success: false,
      message: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      path: filePath,
    };
  }
}

/**
 * Delete a file or directory
 */
export function deletePath(pathToDelete) {
  try {
    ensureBaseDir();
    const fullPath = validatePath(pathToDelete);

    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        message: `Path not found: ${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }

    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      return {
        success: true,
        message: `Directory deleted successfully: ${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    } else if (stats.isFile()) {
      fs.unlinkSync(fullPath);
      return {
        success: true,
        message: `File deleted successfully: ${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    } else {
      return {
        success: false,
        message: `Path is neither a file nor directory: ${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error deleting path: ${error instanceof Error ? error.message : 'Unknown error'}`,
      path: pathToDelete,
    };
  }
}

/**
 * List contents of a directory
 */
export function listDirectory(dirPath = '.') {
  try {
    ensureBaseDir();
    const fullPath = validatePath(dirPath);

    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        message: `Directory not found: ${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }

    const stats = fs.statSync(fullPath);
    if (!stats.isDirectory()) {
      return {
        success: false,
        message: `Path is not a directory: ${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }

    const items = fs.readdirSync(fullPath).map((item) => {
      const itemPath = path.join(fullPath, item);
      const itemStats = fs.statSync(itemPath);
      return {
        name: item,
        type: itemStats.isDirectory() ? 'directory' : 'file',
        size: itemStats.isFile() ? itemStats.size : undefined,
      };
    });

    return {
      success: true,
      items,
      message: `Directory listed successfully: ${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    return {
      success: false,
      message: `Error listing directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      path: dirPath,
    };
  }
}

/**
 * Create a directory
 */
export function createDirectory(dirPath) {
  try {
    ensureBaseDir();
    const fullPath = validatePath(dirPath);

    if (fs.existsSync(fullPath)) {
      return {
        success: false,
        message: `Directory already exists: ${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }

    fs.mkdirSync(fullPath, { recursive: true });

    return {
      success: true,
      message: `Directory created successfully: ${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    return {
      success: false,
      message: `Error creating directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      path: dirPath,
    };
  }
}

/**
 * Check if a file or directory exists
 */
export function exists(pathToCheck) {
  try {
    ensureBaseDir();
    const fullPath = validatePath(pathToCheck);

    const exists = fs.existsSync(fullPath);

    return {
      success: true,
      exists,
      message: `Path ${exists ? 'exists' : 'does not exist'}: ${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    return {
      success: false,
      exists: false,
      message: `Error checking path: ${error instanceof Error ? error.message : 'Unknown error'}`,
      path: pathToCheck,
    };
  }
}

/**
 * Search for files by pattern (simple glob-like search)
 */
export function searchFiles(pattern, searchDir = '.') {
  try {
    ensureBaseDir();
    const fullSearchDir = validatePath(searchDir);

    if (!fs.existsSync(fullSearchDir)) {
      return {
        success: false,
        message: `Search directory not found: ${getRelativePath(fullSearchDir)}`,
        pattern,
        searchDir: getRelativePath(fullSearchDir),
      };
    }

    const stats = fs.statSync(fullSearchDir);
    if (!stats.isDirectory()) {
      return {
        success: false,
        message: `Search path is not a directory: ${getRelativePath(fullSearchDir)}`,
        pattern,
        searchDir: getRelativePath(fullSearchDir),
      };
    }

    const foundFiles = [];

    function searchRecursively(currentDir) {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const relativeItemPath = getRelativePath(itemPath);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          searchRecursively(itemPath);
        } else if (stats.isFile()) {
          // Simple pattern matching (supports * wildcard)
          const regexPattern = pattern.replace(/\*/g, '.*');
          const regex = new RegExp(regexPattern);

          if (regex.test(item) || regex.test(relativeItemPath)) {
            foundFiles.push(relativeItemPath);
          }
        }
      }
    }

    searchRecursively(fullSearchDir);

    return {
      success: true,
      files: foundFiles,
      message: `Found ${foundFiles.length} files matching pattern "${pattern}"`,
      pattern,
      searchDir: getRelativePath(fullSearchDir),
    };
  } catch (error) {
    return {
      success: false,
      message: `Error searching files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      pattern,
      searchDir,
    };
  }
}

// Export all functions as a single object for easy tool registration
export const fileSystemTools = {
  writeFile,
  readFile,
  deletePath,
  listDirectory,
  createDirectory,
  exists,
  searchFiles,
};
