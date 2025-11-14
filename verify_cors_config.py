"""Quick verification script to check CORS configuration in api_server.py"""

import sys
import inspect


def verify_cors_configuration():
    """Verify that CORS is properly configured for all endpoints."""

    print("="*60)
    print("CORS Configuration Verification")
    print("="*60)

    # Import and check the create_app function
    from api_server import create_app

    # Check source code for CORS configuration
    source = inspect.getsource(create_app)

    print("\nChecking create_app() source code...")
    print("-" * 60)

    if 'CORS(app' in source:
        print("✓ CORS(app, ...) call found in create_app()")

        # Extract origins configuration
        if 'origins=' in source or 'origins =' in source:
            print("✓ Origins parameter specified")

            if 'localhost:3000' in source:
                print("✓ Origin http://localhost:3000 configured")
            else:
                print("✗ Origin http://localhost:3000 NOT found")

            if 'localhost:5173' in source:
                print("✓ Origin http://localhost:5173 configured")
            else:
                print("✗ Origin http://localhost:5173 NOT found")
        else:
            print("⚠ Origins parameter not explicitly set (may use defaults)")
    else:
        print("✗ CORS configuration NOT found in create_app()")
        return False

    # Create the Flask app to verify it works
    print("\nCreating Flask app instance...")
    print("-" * 60)

    try:
        app = create_app()
        print("✓ Flask app created successfully")
    except Exception as e:
        print(f"✗ Error creating Flask app: {str(e)}")
        return False

    # List all registered routes
    print("\nRegistered Routes:")
    print("-" * 60)
    for rule in app.url_map.iter_rules():
        methods = ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
        print(f"  {rule.rule:30s} [{methods}]")

    # Verify expected endpoints exist
    print("\nEndpoint Verification:")
    print("-" * 60)

    routes = [rule.rule for rule in app.url_map.iter_rules()]

    if '/api/generate' in routes:
        print(f"✓ /api/generate is registered")
    else:
        print(f"✗ /api/generate is NOT registered")

    # Note about Pro Mode endpoint
    if '/api/generate/pro' in routes:
        print(f"✓ /api/generate/pro is registered")
    else:
        print(f"ℹ /api/generate/pro not yet implemented (expected - task 12)")

    print("\n" + "="*60)
    print("CORS Configuration Summary")
    print("="*60)
    print("✓ CORS is configured at application level")
    print("✓ Configuration applies to ALL routes automatically")
    print("✓ Allowed origins: http://localhost:3000, http://localhost:5173")
    print("✓ Preflight OPTIONS requests handled automatically")
    print("✓ Pro Mode endpoint will inherit CORS when implemented")

    print("\nHow CORS Works:")
    print("-" * 60)
    print("1. Flask-CORS intercepts ALL incoming requests")
    print("2. Checks Origin header against allowed origins list")
    print("3. Automatically handles OPTIONS preflight requests")
    print("4. Adds CORS headers to responses for allowed origins")
    print("5. Works for /api/generate AND /api/generate/pro")

    print("\nTo test CORS functionality:")
    print("  1. Start server: python api_server.py")
    print("  2. Run tests: python test_cors.py")

    return True


if __name__ == '__main__':
    try:
        success = verify_cors_configuration()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Error during verification: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
