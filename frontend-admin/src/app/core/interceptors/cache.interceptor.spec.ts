import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { cacheInterceptor, clearCache } from './cache.interceptor';
import { environment } from '../../../environments/environment';

describe('cacheInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let originalEnableCache: boolean;

  beforeEach(() => {
    // Enable cache for tests
    originalEnableCache = environment.enableCache;
    (environment as any).enableCache = true;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    clearCache();
  });

  afterEach(() => {
    httpMock.verify();
    clearCache();
    // Restore original value
    (environment as any).enableCache = originalEnableCache;
  });

  it('should cache GET requests', (done) => {
    const url = '/api/test';
    const mockData = { data: 'test' };

    // First request - should hit the server
    httpClient.get(url).subscribe(response => {
      expect(response).toEqual(mockData);
      
      // Second request - should use cache (no HTTP call)
      httpClient.get(url).subscribe(cachedResponse => {
        expect(cachedResponse).toEqual(mockData);
        done();
      });
    });

    // Only one HTTP request should be made
    const req = httpMock.expectOne(url);
    req.flush(mockData);
  });

  it('should not cache POST requests', () => {
    const url = '/api/test';
    const mockData = { data: 'test' };

    httpClient.post(url, {}).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    req.flush(mockData);
  });

  it('should not cache auth endpoints', () => {
    const url = '/api/auth/login';
    const mockData = { token: 'test' };

    httpClient.get(url).subscribe();

    const req = httpMock.expectOne(url);
    req.flush(mockData);
  });

  it('should clear cache on demand', (done) => {
    const url = '/api/test';
    const mockData = { data: 'test' };

    // First request
    httpClient.get(url).subscribe(() => {
      // Clear cache
      clearCache();

      // Second request - should hit server again
      httpClient.get(url).subscribe(() => {
        done();
      });

      const req2 = httpMock.expectOne(url);
      req2.flush(mockData);
    });

    const req1 = httpMock.expectOne(url);
    req1.flush(mockData);
  });
});
