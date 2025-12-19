# Agent Guidelines for gmweb

## Build & Test Commands
- `go build -o gmweb` - Build the application
- `go run main.go` - Run directly without building
- `go test ./... -v` - Run all tests with verbose output
- `go test -run TestName -v` - Run single test by name
- `go mod tidy` - Clean up dependencies

## Code Style Guidelines
- **Imports**: Use `go fmt` for formatting, group imports (stdlib, then third-party, then local)
- **Naming**: Use camelCase for functions/variables, PascalCase for types, snake_case for DB fields
- **Error Handling**: Always check errors, use `if err != nil { return err }` pattern
- **Types**: Prefer structs over interfaces, use pointer receivers only when needed
- **Functions**: Keep functions <50 lines, use meaningful parameter names
- **HTML Templates**: Use template inheritance, include CSRF tokens in forms
- **Database**: Use transactions for multi-operation queries, implement proper indexing

## Project Structure
- Controllers handle HTTP, DAOs handle DB operations, models define data structures
- Static assets in `/assets`, templates in `/templates`, config in `/config`
- API routes follow REST conventions under `/api/` namespace