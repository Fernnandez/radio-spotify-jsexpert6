import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { Service } from '../../../server/service.js';
import TestUtil from '../_util/testUtil.js';
import config from '../../../server/config.js';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { join } from 'path';

const {
  dir: { publicDir },
} = config;

describe('#Services - test suit for service functions', () => {
  const service = new Service();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('getFileStream() - Should return a type and name given a file', async () => {
    const filename = '/index.html';
    const mockReadableStream = TestUtil.generateReadableStream(['anything']);
    const expectedType = '.html';

    jest
      .spyOn(Service.prototype, Service.prototype.getFileInfo.name)
      .mockReturnValue({
        type: expectedType,
        name: filename,
      });

    jest
      .spyOn(Service.prototype, Service.prototype.createFileStream.name)
      .mockReturnValue(mockReadableStream);

    const result = await service.getFileStream(filename);

    expect(Service.prototype.createFileStream).toHaveBeenCalledWith(filename);
    expect(result).toEqual({
      stream: mockReadableStream,
      type: expectedType,
    });
  });

  test('getFileInfo() - should return an object containing a name and type', async () => {
    const filename = '/index.html';
    const expectedfullFilePath = join(publicDir, filename);
    const expectedResult = {
      type: '.html',
      name: expectedfullFilePath,
    };

    jest.spyOn(fsPromises, fsPromises.access.name).mockReturnValue();

    const result = await service.getFileInfo(filename);

    expect(fsPromises.access).toHaveBeenCalledWith(expectedfullFilePath);
    expect(result).toEqual(expectedResult);
  });

  test('crteateFileStream() - should return a fileStream', async () => {
    const filename = 'help-ukraine.html';

    const mockReadableStream = TestUtil.generateReadableStream(['anything']);

    jest
      .spyOn(fs, fs.createReadStream.name)
      .mockReturnValue(mockReadableStream);

    const result = await service.createFileStream(filename);

    expect(fs.createReadStream).toHaveBeenCalledWith(filename);
    expect(result).toEqual(mockReadableStream);
  });

  describe('exceptions', () => {
    test('getFileStream() - should return an error if file does not exis', async () => {
      const filename = '/anything.html';

      jest
        .spyOn(Service.prototype, Service.prototype.getFileInfo.name)
        .mockRejectedValue(new Error('Error: ENOENT'));

      await expect(service.getFileStream(filename)).rejects.toThrow();
      expect(Service.prototype.getFileInfo).toHaveBeenCalledWith(filename);
    });

    test('getFileInfo() - should return an error if file does not exis', async () => {
      const filename = '/anything.html';
      const expectedfullFilePath = join(publicDir, filename);

      jest
        .spyOn(fsPromises, fsPromises.access.name)
        .mockRejectedValue(
          new Error('Error: ENOENT: no such file or directory')
        );

      const result = service.getFileInfo(filename);

      expect(fsPromises.access).toHaveBeenCalledWith(expectedfullFilePath);
      await expect(result).rejects.toThrow();
    });
  });
});
