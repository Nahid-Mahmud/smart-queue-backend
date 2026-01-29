import envVariables from "../src/app/config/env";

describe('Demo Test Suite', () => {
  it('should pass a basic math test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have NODE_ENV set to test', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it("should use a test database", async () => {
    // eslint-disable-next-line no-console
    console.log(envVariables.MONGO_URI);
    expect(envVariables.MONGO_URI).toContain('test_');
  });
});
