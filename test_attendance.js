async function test() {
  const studentId = 'STU002-TEST';
  console.log('Testing Attendance API...');
  
  // Create test student with photo
  let res = await fetch('http://localhost:5000/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      studentId, 
      name: 'Attendance User', 
      email: 'att@example.com', 
      class: '10A',
      photograph: 'https://example.com/face.jpg'
    })
  });
  let studentData = await res.json();
  console.log('STUDENT CREATED (Photo):', studentData.photograph);

  const testDate = new Date().toISOString().split('T')[0];

  // Mark Present
  res = await fetch('http://localhost:5000/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, date: testDate, status: 'present', class: '10A' })
  });
  let attData = await res.json();
  console.log('ATTENDANCE CREATED:', attData.status);

  // Mark Late (Upsert overwrite check)
  res = await fetch('http://localhost:5000/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, date: testDate, status: 'late', class: '10A' })
  });
  attData = await res.json();
  console.log('ATTENDANCE UPSERTED:', attData.status);

  // Get Stats
  res = await fetch(`http://localhost:5000/api/attendance/stats?date=${testDate}&class=10A`);
  let stats = await res.json();
  console.log('STATS:', stats);

  // Delete Attendance
  if (attData._id) {
     res = await fetch('http://localhost:5000/api/attendance/' + attData._id, { method: 'DELETE' });
     let delData = await res.json();
     console.log('DELETE:', delData);
  }

  // Delete Student
  if (studentData._id) {
    await fetch('http://localhost:5000/api/students/' + studentData._id, { method: 'DELETE' });
  }
}
test();
