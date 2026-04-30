const payload = {
  name: 'priyanshu',
  phone: '9861149422',
  email: 'sahupriyanshu2006@gmail.com',
  password: '123456',
  role: 'guest'
};

async function testSignup() {
  const res = await fetch('http://localhost:8000/api/users/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  console.log(res.status);
  console.log(text);
}

testSignup();
