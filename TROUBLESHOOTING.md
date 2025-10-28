# Troubleshooting Guide

## Issue: Module not found errors in Docker

### Problem
When accessing `/report-builder`, you see errors like:
```
Module not found: Can't resolve '@dnd-kit/core'
```

### Root Cause
When running the application in Docker with bind mounts, the `node_modules` directory inside the container is separate from the one on your host machine. Adding new dependencies to `package.json` requires installing them inside the container.

### Solution

**Option 1: Install inside the running container (Quick Fix)**
```bash
docker-compose exec frontend npm install
docker-compose restart frontend
```

**Option 2: Rebuild the container (Clean approach)**
```bash
docker-compose down
docker-compose build frontend
docker-compose up -d
```

**Option 3: Stop Docker and run locally**
```bash
# Stop Docker
docker-compose down

# Run frontend locally
cd frontend
npm install
npm run dev

# In another terminal, run backend
cd backend
python -m uvicorn app.main:app --reload
```

---

## Issue: Dependencies added but page still fails

### Symptoms
- Ran `npm install` but still getting "Module not found" errors
- Package appears in `package.json` but not working

### Solution Steps

1. **Clear Next.js cache**:
   ```bash
   docker-compose exec frontend rm -rf .next
   docker-compose restart frontend
   ```

2. **Verify packages are installed**:
   ```bash
   docker-compose exec frontend npm list @dnd-kit/core
   ```
   Should show the package version, not "UNMET DEPENDENCY"

3. **Check node_modules in container**:
   ```bash
   docker-compose exec frontend ls node_modules/@dnd-kit/
   ```
   Should list: `core`, `sortable`, `utilities`

4. **Reinstall all dependencies**:
   ```bash
   docker-compose exec frontend rm -rf node_modules package-lock.json
   docker-compose exec frontend npm install
   docker-compose restart frontend
   ```

---

## Issue: Page shows loading spinner forever

### Symptoms
- Navigate to Report Builder
- Page shows "Loading..." and never loads
- No errors in console

### Possible Causes & Solutions

**Cause 1: Not logged in**
- **Check**: Are you logged in?
- **Solution**: Go to `/login` and login first

**Cause 2: Backend not running**
- **Check**: http://localhost:8000/api/health
- **Solution**:
  ```bash
  docker-compose logs backend
  docker-compose restart backend
  ```

**Cause 3: UserContext not initialized**
- **Check**: Browser console for errors
- **Solution**: Clear localStorage and login again
  ```javascript
  // In browser console:
  localStorage.clear();
  window.location.href = '/login';
  ```

---

## Issue: Blueprint generation fails with 500 error

### Symptoms
- Complete the wizard
- Click "Build Report Blueprint"
- Error: "Failed to generate blueprint"

### Possible Causes & Solutions

**Cause 1: LLM API key not configured**
- **Check**: Backend logs show "API key not found"
- **Solution**:
  ```bash
  # Add to .env file
  OPENAI_API_KEY=sk-...
  # OR
  ANTHROPIC_API_KEY=sk-ant-...

  # Restart backend
  docker-compose restart backend
  ```

**Cause 2: LLM rate limit exceeded**
- **Check**: Backend logs show "rate limit" or "429" error
- **Solution**: Wait a few minutes and try again

**Cause 3: Invalid JSON from LLM**
- **Check**: Backend logs show JSON parsing error
- **Solution**: Try again - the backend has fallback parsing. If it persists, the LLM prompt may need adjustment

---

## Issue: Drag and drop not working

### Symptoms
- Can see blueprint sections
- Can't reorder them by dragging

### Solutions

1. **Make sure you're grabbing the handle**:
   - Look for the ☰ icon on the left of each card
   - Click and drag from that icon, not from the card body

2. **Check if dnd-kit is loaded**:
   ```bash
   docker-compose exec frontend npm list @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

3. **Browser compatibility**:
   - Try a different browser (Chrome, Firefox, Safari)
   - Make sure JavaScript is enabled
   - Disable browser extensions that might interfere

---

## Issue: TypeScript errors

### Symptoms
- Red squiggly lines in VS Code
- Type errors when building

### Solutions

1. **Restart TypeScript server** (VS Code):
   - Cmd/Ctrl + Shift + P
   - Type "Restart TypeScript Server"
   - Press Enter

2. **Check imports**:
   - Make sure paths use `@/` prefix for absolute imports
   - Example: `import { Button } from '@/components/ui/button'`

3. **Verify type files exist**:
   ```bash
   ls frontend/types/blueprint.types.ts
   ls frontend/types/form.types.ts
   ```

---

## Issue: Styles not applying correctly

### Symptoms
- Components render but look broken
- Missing colors, spacing, or layout

### Solutions

1. **Check Tailwind CSS is running**:
   ```bash
   docker-compose logs frontend | grep tailwind
   ```

2. **Rebuild CSS**:
   ```bash
   docker-compose exec frontend npm run build
   docker-compose restart frontend
   ```

3. **Check for conflicting classes**:
   - Open browser DevTools
   - Inspect the element
   - Look for CSS conflicts or overrides

---

## General Debugging Steps

### 1. Check All Services Are Running
```bash
docker-compose ps
```
Should show all three services (frontend, backend, database) as "Up"

### 2. Check Logs
```bash
# All logs
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs backend

# Follow logs in real-time
docker-compose logs -f frontend
```

### 3. Restart Everything
```bash
docker-compose down
docker-compose up -d
```

### 4. Nuclear Option (Full Reset)
```bash
# Stop everything
docker-compose down -v

# Remove all containers, volumes, images
docker-compose down --rmi all --volumes

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### 5. Check Environment Variables
```bash
# View backend environment
docker-compose exec backend env | grep -E "(OPENAI|ANTHROPIC|DATABASE)"

# Check .env file exists
ls -la .env
cat .env
```

---

## Browser Console Debugging

Open browser DevTools (F12) and check:

### Console Tab
- Look for JavaScript errors (red text)
- Look for failed network requests
- Check for React warnings

### Network Tab
- Check if API calls are succeeding
- Look for failed requests (red text)
- Check response codes and bodies

### Application Tab
- Check localStorage for user data:
  ```javascript
  localStorage.getItem('user')
  ```
- Clear localStorage if needed:
  ```javascript
  localStorage.clear()
  ```

---

## Common Error Messages

### "Network Error"
- **Meaning**: Can't reach the backend
- **Solution**: Check backend is running on port 8000

### "401 Unauthorized"
- **Meaning**: Not logged in or session expired
- **Solution**: Login again

### "429 Too Many Requests"
- **Meaning**: LLM API rate limit hit
- **Solution**: Wait a few minutes

### "502 Bad Gateway"
- **Meaning**: LLM API is down or unreachable
- **Solution**: Check API key and internet connection

### "Module not found"
- **Meaning**: Missing npm package
- **Solution**: See "Module not found errors" section above

---

## Getting Help

If none of these solutions work:

1. **Check the logs thoroughly**:
   ```bash
   docker-compose logs > logs.txt
   ```

2. **Share relevant error messages** from:
   - Browser console
   - Backend logs
   - Frontend logs

3. **Provide context**:
   - What were you trying to do?
   - What steps did you follow?
   - What did you expect to happen?
   - What actually happened?

4. **Include system info**:
   - OS version
   - Docker version: `docker --version`
   - Node version: `node --version`
   - Browser and version

---

**Last Updated**: 2025-10-27
