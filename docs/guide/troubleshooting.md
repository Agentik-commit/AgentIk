# Troubleshooting

This guide helps you resolve common issues when working with Agentik.

## Common Issues

### Port Already in Use

```bash
# Kill existing Node processes
pkill -f "node server.js"

# Or change the port in .env
PORT=5002
```

### Frontend Assets Not Loading

```bash
# Rebuild the frontend
cd agentik
npm run build
cd ..
npm start
```

### Database Connection Issues

- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- The system will fallback to in-memory storage

### AI Model Connection Issues

- Verify provider configuration
- Check network connectivity
- Review API key permissions

## Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/Agentik-commit/AgentIk/issues)
- **Discussions**: [Ask questions](https://github.com/Agentik-commit/AgentIk/discussions)
