// Test script for all authentication APIs
// Usage: npx ts-node scripts/test-auth-apis.ts

import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3000/api/auth'

async function testSignup() {
  console.log('🧪 Testing signup API...')
  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@gmail.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        acceptTerms: true
      })
    })
    const data = await response.json()
    console.log(`✅ Signup: ${response.status} - ${data.message || data.error}`)
    return response.ok
  } catch (error) {
    console.log(`❌ Signup failed: ${error.message}`)
    return false
  }
}

async function testSignin() {
  console.log('🧪 Testing signin API...')
  try {
    const response = await fetch(`${API_BASE}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Use existing test user
        password: 'password123'
      })
    })
    const data = await response.json()
    console.log(`✅ Signin: ${response.status} - ${data.message || data.error}`)
    return response.ok
  } catch (error) {
    console.log(`❌ Signin failed: ${error.message}`)
    return false
  }
}

async function testSession() {
  console.log('🧪 Testing session API...')
  try {
    const response = await fetch(`${API_BASE}/session`)
    const data = await response.json()
    console.log(`✅ Session: ${response.status} - ${data.user ? 'Authenticated' : data.error}`)
    return response.ok
  } catch (error) {
    console.log(`❌ Session failed: ${error.message}`)
    return false
  }
}

async function testResetPassword() {
  console.log('🧪 Testing reset-password API...')
  try {
    const response = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    })
    const data = await response.json()
    console.log(`✅ Reset Password: ${response.status} - ${data.message || data.error}`)
    return response.ok
  } catch (error) {
    console.log(`❌ Reset Password failed: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Testing all authentication APIs...\n')

  const results = await Promise.all([
    testSignup(),
    testSignin(),
    testSession(),
    testResetPassword()
  ])

  const passed = results.filter(Boolean).length
  const total = results.length

  console.log(`\n📊 Results: ${passed}/${total} tests passed`)

  if (passed === total) {
    console.log('🎉 All authentication APIs are working!')
  } else {
    console.log('⚠️  Some APIs need attention')
  }
}

main().catch(console.error)