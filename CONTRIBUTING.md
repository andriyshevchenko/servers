# Contributing to Atomic Memory MCP

Thank you for your interest in contributing to Atomic Memory MCP! 🎉

## 🤝 How to Contribute

We welcome contributions in many forms:
- 🐛 Bug reports and fixes
- ✨ Feature requests and implementations
- 📖 Documentation improvements
- 🧪 Test coverage improvements
- 💡 Usage examples and tutorials
- 🎨 UI/UX improvements for Neo4j visualizations

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- (Optional) Docker for Neo4j testing

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/atomic-memory-mcp.git
   cd atomic-memory-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd src/memory-enhanced
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   cd src/memory-enhanced
   npm test
   ```

5. **Start Neo4j (optional, for graph visualization)**
   ```bash
   docker-compose up
   ```

## 🔨 Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

3. **Run tests and type checking**
   ```bash
   cd src/memory-enhanced
   npm test
   npx tsc --noEmit
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for test additions/changes
   - `refactor:` for code refactoring
   - `chore:` for maintenance tasks

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a PR on GitHub with a clear description of your changes.

## 📝 Code Style Guidelines

- Use TypeScript with strict type checking
- Follow the existing code structure and patterns
- Keep functions small and focused
- Add JSDoc comments for public APIs
- Use meaningful variable and function names
- Prefer async/await over raw promises

## 🧪 Testing Guidelines

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Test both JSONL and Neo4j backends when applicable
- Include edge cases and error scenarios
- Mock external dependencies appropriately

Example test structure:
```typescript
describe('feature name', () => {
  it('should do something specific', async () => {
    // Arrange
    const input = ...;
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

## 📖 Documentation Guidelines

- Update README.md if adding user-facing features
- Add JSDoc comments to public APIs
- Include code examples in documentation
- Keep documentation clear and concise
- Update CHANGELOG.md for notable changes

## 🐛 Reporting Bugs

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, MCP client)
- Error messages and logs
- Minimal reproduction example if possible

Use the bug report issue template.

## 💡 Feature Requests

When requesting features, please include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation approach (optional)
- Examples of how it would be used

Use the feature request issue template.

## 📋 Pull Request Process

1. **Ensure CI passes** - All tests, linting, and builds must pass
2. **Update documentation** - Keep docs in sync with code changes
3. **Add tests** - New features need test coverage
4. **Keep PRs focused** - One feature/fix per PR
5. **Respond to feedback** - Address review comments promptly
6. **Squash commits** - We'll squash on merge, but clean history helps

### PR Checklist

- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (for notable changes)
- [ ] Commit messages follow conventional format
- [ ] No breaking changes (or clearly documented)
- [ ] TypeScript type checking passes

## 🎯 Good First Issues

Look for issues labeled `good-first-issue` or `help-wanted` - these are great starting points for new contributors!

## 🌟 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes for significant contributions
- Special thanks in major version releases

## 📞 Getting Help

- 💬 Open a GitHub Discussion for questions
- 🐛 Create an issue for bugs
- 📧 Contact maintainers for sensitive issues

## 📜 Code of Conduct

Please be respectful and constructive in all interactions. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making Atomic Memory MCP better!** 🚀
