/**
 * Automated Verification Script for Endpoints & Anti-Cheat
 */

async function runTests() {
  console.log('--- 1. Testing GET /api/health ---');
  const healthRes = await fetch('http://localhost:3000/api/health');
  const healthData = await healthRes.json();
  console.log('Status:', healthRes.status, healthData);

  console.log('\n--- 2. Testing GET /api/leaderboard ---');
  const boardRes = await fetch('http://localhost:3000/api/leaderboard?limit=5');
  const boardData = await boardRes.json();
  console.log('Leaderboard Count:', boardData.count, 'Top warrior:', boardData.data[0]?.playerName);

  console.log('\n--- 3. Testing POST /api/score (Valid payload) ---');
  const validPayload = {
    playerName: 'Sanket_Demo',
    wpm: 112,
    accuracy: 98,
    score: 10976,
    difficulty: 'hard'
  };
  const postRes = await fetch('http://localhost:3000/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload)
  });
  const postData = await postRes.json();
  console.log('Post Status:', postRes.status, 'Response:', postData.message);

  console.log('\n--- 4. Testing Anti-Cheat Rejection (WPM = 999) ---');
  const cheatPayload = {
    playerName: 'Bot_Hacker',
    wpm: 999,
    accuracy: 100,
    score: 999999,
    difficulty: 'hard'
  };
  const cheatRes = await fetch('http://localhost:3000/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cheatPayload)
  });
  const cheatData = await cheatRes.json();
  console.log('Cheat Rejection Status (Must be 400):', cheatRes.status);
  console.log('Server rejection message:', cheatData.error);

  console.log('\n--- 5. Testing Static Client Serving (GET /) ---');
  const htmlRes = await fetch('http://localhost:3000/');
  const htmlText = await htmlRes.text();
  console.log('HTML Status:', htmlRes.status, 'Includes title:', htmlText.includes('Keyboard Warrior'));

  if (healthRes.ok && boardRes.ok && postRes.ok && cheatRes.status === 400 && htmlRes.ok) {
    console.log('\n✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('\n❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
