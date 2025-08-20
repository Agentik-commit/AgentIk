# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report

1. **Email Security Team**: Send an email to [security@agentik.dev](mailto:security@agentik.dev)
2. **Subject Line**: Use "SECURITY VULNERABILITY: [Brief Description]" format
3. **Detailed Description**: Include:
   - Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
   - Affected component or endpoint
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Response Time**: We aim to respond within 48 hours
- **Acknowledgment**: You'll receive an acknowledgment of your report
- **Investigation**: Our security team will investigate the reported issue
- **Updates**: We'll keep you informed of our progress
- **Disclosure**: We'll coordinate disclosure with you once a fix is ready

### Responsible Disclosure

We follow responsible disclosure practices:

- **No Public Disclosure**: Vulnerabilities are not disclosed publicly until a fix is available
- **Coordinated Release**: Security fixes are released simultaneously with vulnerability disclosure
- **Credit**: Security researchers are credited in our security advisories
- **Timeline**: We aim to fix critical vulnerabilities within 30 days

## Security Features

### Authentication & Authorization

- **API Keys**: Secure storage of provider API credentials
- **Encryption**: AES-GCM encryption for sensitive data
- **Access Control**: Owner-based resource isolation
- **Rate Limiting**: Protection against abuse and brute force attacks

### Data Protection

- **Input Validation**: All user inputs are validated and sanitized
- **SQL Injection Protection**: Parameterized queries and input sanitization
- **XSS Prevention**: Content Security Policy (CSP) headers
- **CSRF Protection**: Token-based request validation

### Network Security

- **HTTPS Only**: All communications use TLS encryption
- **Security Headers**: Comprehensive security headers including:
  - `Content-Security-Policy`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
- **CORS Configuration**: Restrictive cross-origin resource sharing

### Environment Security

- **Secret Management**: Environment variables for sensitive configuration
- **No Hardcoded Secrets**: All secrets are externalized
- **Secure Defaults**: Secure-by-default configuration
- **Audit Logging**: Comprehensive logging of security events

## Secret Handling

### API Credentials

- **Encryption**: Stored using AES-GCM encryption
- **Key Rotation**: Support for credential rotation
- **Access Logging**: All credential access is logged
- **Secure Storage**: No plaintext storage of sensitive data

### Environment Variables

- **Required Variables**: 
  - `CREDENTIALS_KEY`: 32-byte encryption key
  - `DATABASE_URL`: Database connection string (if using external DB)
- **Optional Variables**:
  - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE`: Supabase integration
  - `TINYTOWN_URL`: TinyTown service integration

### Best Practices

- **Never commit secrets** to version control
- **Use strong, unique keys** for encryption
- **Rotate credentials** regularly
- **Monitor access logs** for suspicious activity
- **Use environment-specific** configuration files

## Security Updates

### Update Process

1. **Security Issue Identified**: Through reports or internal audits
2. **Risk Assessment**: Evaluate severity and impact
3. **Fix Development**: Develop and test security patches
4. **Security Review**: Code review focused on security implications
5. **Testing**: Comprehensive security testing
6. **Release**: Coordinated release with security advisory

### Update Channels

- **GitHub Releases**: Tagged releases with security notes
- **Security Advisories**: GitHub Security Advisories for critical issues
- **Email Notifications**: Direct notification to security contacts
- **Documentation Updates**: Security documentation is updated with each release

## Security Checklist

### For Contributors

- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user inputs
- [ ] Proper error handling without information disclosure
- [ ] Security headers implemented
- [ ] Authentication checks on protected endpoints
- [ ] Rate limiting on public APIs
- [ ] Logging of security-relevant events

### For Reviewers

- [ ] Security implications considered
- [ ] Authentication and authorization verified
- [ ] Input validation implemented
- [ ] Error handling secure
- [ ] No information disclosure in errors
- [ ] Security headers maintained
- [ ] Rate limiting appropriate

## Security Tools

### Static Analysis

- **ESLint**: JavaScript/TypeScript security rules
- **npm audit**: Dependency vulnerability scanning
- **CodeQL**: GitHub's semantic code analysis

### Runtime Security

- **Helmet.js**: Security middleware for Express
- **Rate Limiting**: Express rate limiting middleware
- **Input Validation**: Joi or similar validation libraries
- **Encryption**: Node.js crypto module for AES-GCM

### Monitoring

- **Security Logging**: Comprehensive security event logging
- **Access Monitoring**: Track API access patterns
- **Error Monitoring**: Monitor for security-related errors
- **Performance Monitoring**: Detect potential DoS attacks

## Security Contacts

- **Security Team**: [security@agentik.dev](mailto:security@agentik.dev)
- **Project Maintainers**: [maintainers@agentik.dev](mailto:maintainers@agentik.dev)
- **Emergency Contact**: [emergency@agentik.dev](mailto:emergency@agentik.dev)

## Security Acknowledgments

We would like to thank the security researchers and community members who have helped improve the security of Agentik through responsible disclosure and constructive feedback.

## Security Policy Updates

This security policy may be updated as our security practices evolve. Significant changes will be announced through:

- GitHub Security Advisories
- Release notes
- Direct communication to security contacts
- Documentation updates

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Next Review**: July 2025
