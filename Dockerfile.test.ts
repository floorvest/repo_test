import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Dockerfile', () => {
  let dockerfileContent: string;

  beforeEach(() => {
    const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
    dockerfileContent = fs.readFileSync(dockerfilePath, 'utf-8');
  });

  it('should exist', () => {
    const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);
  });

  it('should use node:20-alpine as base image', () => {
    expect(dockerfileContent).toContain('FROM node:20-alpine');
  });

  it('should create a non-root user for security', () => {
    expect(dockerfileContent).toContain('addgroup -g 1001 -S appuser');
    expect(dockerfileContent).toContain('adduser -S appuser -u 1001');
  });

  it('should set working directory to /app', () => {
    expect(dockerfileContent).toContain('WORKDIR /app');
  });

  it('should copy files with proper ownership', () => {
    expect(dockerfileContent).toContain('COPY --chown=appuser:appuser . .');
  });

  it('should install http-server globally', () => {
    expect(dockerfileContent).toContain('npm install -g http-server');
  });

  it('should switch to appuser before running', () => {
    expect(dockerfileContent).toContain('USER appuser');
  });

  it('should expose port 3000', () => {
    expect(dockerfileContent).toContain('EXPOSE 3000');
  });

  it('should include a healthcheck', () => {
    expect(dockerfileContent).toContain('HEALTHCHECK');
    expect(dockerfileContent).toContain('http://localhost:3000/');
    expect(dockerfileContent).toContain('--interval=30s');
    expect(dockerfileContent).toContain('--timeout=3s');
  });

  it('should start http-server on port 3000', () => {
    expect(dockerfileContent).toContain('CMD ["http-server", "-p", "3000", "-H", "0.0.0.0"]');
  });
});
