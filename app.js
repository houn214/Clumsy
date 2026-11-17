const OWNER = 'houn214';
const REPO = 'Clumsy';
const FILE_PATH = 'characters.json';

let characters = [];

// 1. 페이지 열릴 때 characters.json 불러오기
async function loadCharacters() {
  try {
    // 캐시 방지를 위해 timestamp 추가
    const res = await fetch(`${FILE_PATH}?t=${Date.now()}`);
    characters = await res.json();
    renderCharacters();
  } catch (err) {
    document.getElementById('character-list').innerText = '데이터를 불러오지 못했습니다. characters.json 형식을 확인하세요.';
  }
}

// 2. 화면에 캐릭터 카드 그리기 (직접 수정 가능)
function renderCharacters() {
  const listEl = document.getElementById('character-list');
  listEl.innerHTML = '';

  characters.forEach((char, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <strong>이름:</strong> <input type="text" value="${char.name || ''}" onchange="updateField(${index}, 'name', this.value)">
      <strong>직업:</strong> <input type="text" value="${char.job || ''}" onchange="updateField(${index}, 'job', this.value)"><br>
      <strong>HP:</strong> <input type="number" value="${char.hp || 0}" onchange="updateField(${index}, 'hp', Number(this.value))">
      <strong>STR:</strong> <input type="number" value="${char.str || 0}" onchange="updateField(${index}, 'str', Number(this.value))">
      <button onclick="deleteCharacter(${index})" style="color:red;">삭제</button>
    `;
    listEl.appendChild(card);
  });
}

function updateField(index, field, value) {
  characters[index][field] = value;
}

function addCharacter() {
  const name = document.getElementById('new-name').value.trim();
  if (!name) return alert('이름을 입력하세요.');

  characters.push({
    name: name,
    job: document.getElementById('new-job').value.trim(),
    hp: Number(document.getElementById('new-hp').value) || 0,
    str: Number(document.getElementById('new-str').value) || 0
  });
  renderCharacters();
}

function deleteCharacter(index) {
  if (confirm('정말 삭제하시겠습니까?')) {
    characters.splice(index, 1);
    renderCharacters();
  }
}

// 3. GitHub API를 호출해 characters.json 덮어쓰기 (Commit 발생)
async function saveToGitHub() {
  const token = document.getElementById('gh-token').value.trim();
  if (!token) return alert('수정을 저장하려면 GitHub 토큰을 입력해야 합니다.');

  const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;

  try {
    // 기존 파일의 SHA 가져오기
    const getRes = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${token}` }
    });
    const fileData = await getRes.json();

    // 새 내용으로 커밋 요청
    const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(characters, null, 2))));
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update character stats (${new Date().toLocaleString()})`,
        content: contentEncoded,
        sha: fileData.sha
      })
    });

    if (putRes.ok) {
      alert('저장 완료! 깃허브 커밋 히스토리에 수정 로그가 남았습니다.');
    } else {
      alert('저장 실패: 토큰 권한(repo)을 확인해주세요.');
    }
  } catch (err) {
    alert('오류 발생: ' + err.message);
  }
}

loadCharacters();
