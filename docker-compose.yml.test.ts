import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

describe('docker-compose.yml', () => {
  let composeConfig: any;

  beforeEach(() => {
    const composePath = path.join(process.cwd(), 'docker-compose.yml');
    const fileContent = fs.readFileSync(composePath, 'utf-8');
    composeConfig = yaml.load(fileContent) as any;
  });

  it('should exist', () => {
    const composePath = path.join(process.cwd(), 'docker-compose.yml');
    expect(fs.existsSync(composePath)).toBe(true);
  });

  it('should use docker-compose version 3.8', () => {
    expect(composeConfig.version).toBe('3.8');
  });

  it('should define an app service', () => {
    expect(composeConfig.services).toBeDefined();
    expect(composeConfig.services.app).toBeDefined();
  });

  it('should build from current context with Dockerfile', () => {
    const appService = composeConfig.services.app;
    expect(appService.build.context).toBe('.');
    expect(appService.build.dockerfile).toBe('Dockerfile');
  });

  it('should set container name to my-project-app', () => {
    expect(composeConfig.services.app.container_name).toBe('my-project-app');
  });

  it('should expose port 3000', () => {
    const appService = composeConfig.services.app;
    expect(appService.expose).toContain('3000');
  });

  it('should map port 3000 to 3000', () => {
    const appService = composeConfig.services.app;
    expect(appService.ports).toContain('3000:3000');
  });

  it('should set NODE_ENV to production', () => {
    const appService = composeConfig.services.app;
    expect(appService.environment).toContain('NODE_ENV=production');
  });

  it('should have a healthcheck configured', () => {
    const appService = composeConfig.services.app;
    expect(appService.healthcheck).toBeDefined();
  });

  it('should healthcheck by testing localhost:3000', () => {
    const healthcheck = composeConfig.services.app.healthcheck;
    expect(healthcheck.test).toContain('http://localhost:3000/');
  });

  it('should set healthcheck interval to 30s', () => {
    const healthcheck = composeConfig.services.app.healthcheck;
    expect(healthcheck.interval).toBe('30s');
  });

  it('should set healthcheck timeout to 3s', () => {
    const healthcheck = composeConfig.services.app.healthcheck;
    expect(healthcheck.timeout).toBe('3s');
  });

  it('should set restart policy to unless-stopped', () => {
    expect(composeConfig.services.app.restart).toBe('unless-stopped');
  });
});
