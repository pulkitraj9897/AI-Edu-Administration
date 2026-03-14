async function test() {
  const studentId = 'STU001-TEST';
  console.log('Testing Marks API...');
  
  // Create test student
  await fetch('http://localhost:5000/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, name: 'Test Student', email: 'test@example.com', class: '10A' })
  });

  // Create mark
  let res = await fetch('http://localhost:5000/api/marks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, examName: 'Midterm', subject: 'Math', marksObtained: 85, totalMarks: 100 })
  });
  let data = await res.json();
  console.log('CREATE:', data);

  if (!data._id) {
     console.error("Failed to create mark:", data);
     return;
  }
  const markId = data._id;

  // Get marks
  res = await fetch('http://localhost:5000/api/marks?studentId=' + studentId);
  data = await res.json();
  console.log('READ counts:', data.length);

  // Update mark
  res = await fetch('http://localhost:5000/api/marks/' + markId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marksObtained: 95 })
  });
  data = await res.json();
  console.log('UPDATE:', data.marksObtained);

  // Delete mark
  res = await fetch('http://localhost:5000/api/marks/' + markId, { method: 'DELETE' });
  data = await res.json();
  console.log('DELETE:', data);

  // clean up student
  const studentsReq = await fetch('http://localhost:5000/api/students');
  const students = await studentsReq.json();
  const studentToDelete = students.find(s => s.studentId === studentId);
  if (studentToDelete) {
     await fetch('http://localhost:5000/api/students/' + studentToDelete._id, { method: 'DELETE' });
  }
}
test();
