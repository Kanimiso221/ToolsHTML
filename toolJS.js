// イベントが飛んできたときに動くもの
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const resultDiv = document.getElementById('result');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/html') {
            const reader = new FileReader();

            reader.onload = (e) => {
                const text       = e.target.result;
                const parser     = new DOMParser();
                const doc        = parser.parseFromString(text, 'text/html');
                const paragraphs = doc.querySelectorAll('p');
                const results    = {};

                paragraphs.forEach((p) => {
                    if (p.textContent.includes('ccb') || p.textContent.includes('CCB') || p.textContent.includes('【正気度ロール】')) {
                        const characterName = p.querySelector('span:nth-child(2)').textContent.trim();
                        const resultText    = p.querySelector('span:nth-child(3)').textContent;
                        const resultParts   = resultText.split(' ＞ ');
                        const rollResult    = parseInt(resultParts[resultParts.length - 2]);
                        const result        = resultParts.pop().trim();

                        if (!results[characterName]) {
                            results[characterName] = {
                                '1クリ': 0, '決定的成功': 0, '成功': 0,
                                '失敗': 0, '致命的失敗': 0, '100ファン': 0, 'SANC成功' : 0, 'SANC失敗' : 0
                            };
                        }

                        if (result === '成功') {

                            results[characterName]['成功']++;

                            if (p.textContent.includes('【正気度ロール】')) results[characterName]['SANC成功']++;

                        } else if (result === 'スペシャル') {

                            results[characterName]['成功']++;

                        } else if (result === '失敗') {

                            results[characterName]['失敗']++;

                            if (p.textContent.includes('【正気度ロール】')) results[characterName]['SANC失敗']++;

                        } else if (result === '決定的成功' || result === '決定的成功/スペシャル') {

                            results[characterName]['成功']++;
                            results[characterName]['決定的成功']++;

                            if (rollResult === 1) {
                                results[characterName]['1クリ']++;
                            }

                        } else if (result === '致命的失敗'){

                            results[characterName]['失敗']++;
                            results[characterName]['致命的失敗']++;

                            if (rollResult === 100) {
                                results[characterName]['100ファン']++;
                            }
                        }
                    } 
                });

                // 結果の出力部分をテーブルで作成
                let output = '<table><tr><th>キャラクター名</th><th>1クリ</th><th>クリティカル</th><th>成功</th><th>失敗</th><th>ファンブル</th><th>100ファン</th><th>SANC成功</th><th>SANC失敗</th></tr>';
                for (const [character, counts] of Object.entries(results)) {
                    output += `<tr><td>${character}</td><td>${counts['1クリ']}</td><td>${counts['決定的成功']}</td><td>${counts['成功']}</td><td>${counts['失敗']}</td><td>${counts['致命的失敗']}</td><td>${counts['100ファン']}</td><td>${counts['SANC成功']}</td><td>${counts['SANC失敗']}</td></tr>`;
                }
                output += '</table>';

                resultDiv.innerHTML = output;
            };

            reader.readAsText(file);
        }
    });
});

function openTab(evt, tabName) {
    // すべてのタブコンテンツを非表示にする
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // すべてのタブリンクを非アクティブにする
    var tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // 選択されたタブコンテンツを表示し、タブをアクティブにする
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.getElementById('npcForm').addEventListener('submit', function(e) {
    e.preventDefault(); // フォームの送信を阻止

    const formData  = new FormData(this);

    const name      = formData.get('name');
    const hp        = formData.get('hp') || Math.floor((parseInt(formData.get('con')) + parseInt(formData.get('siz'))) / 2);
    const mp        = formData.get('mp') || parseInt(formData.get('pow'));
    const san       = formData.get('san') || parseInt(formData.get('pow')) * 5;
    const str       = formData.get('str');
    const con       = formData.get('con');
    const pow       = formData.get('pow');
    const dex       = formData.get('dex');
    const app       = formData.get('app');
    const siz       = formData.get('siz');
    const int       = formData.get('int');
    const edu       = formData.get('edu');
    const addAttack = damageBonus(str, siz);

    let command = '1d100<={SAN} 【正気度ロール】\n' +
                  'CCB<={INT}*5 【アイデア】\n' +
                  'CCB<={POW}*5 【幸運】\n' +
                  'CCB<={EDU}*5 【知識】\n';

    const skillsDiv     = document.getElementById('skills');
    const skillElements = skillsDiv.getElementsByClassName('skillSet');
    for (let i = 0; i < skillElements.length; i++) {
        const skillNameElement  = skillElements[i].querySelector('.skillName');
        const skillValueElement = skillElements[i].querySelector('.skillValue');
        if (skillNameElement && skillValueElement && skillNameElement.value && skillValueElement.value) {
            command += `CCB<=${skillValueElement.value} 【${skillNameElement.value}】\n`;
        }
    }

    command += '1d3' + addAttack + ' 【ダメージ判定】\n' +
               '1d4' + addAttack + ' 【ダメージ判定】\n' +
               '1d6' + addAttack + ' 【ダメージ判定】\n' +
               'CCB<={STR}5 【STR × 5】\n' +
               'CCB<={CON}5 【CON × 5】\n' +
               'CCB<={POW}5 【POW × 5】\n' +
               'CCB<={DEX}5 【DEX × 5】\n' +
               'CCB<={APP}5 【APP × 5】\n' +
               'CCB<={SIZ}5 【SIZ × 5】\n' +
               'CCB<={INT}5 【INT × 5】\n' +
               'CCB<={EDU}5 【EDU × 5】\n';

    // JSONデータを作成
    const npcData = {
        kind: "character",
        data: {
            name: name,
            initiative: dex,
            externalUrl: null,
            iconUrl: null,
            commands: command,
            status: [{
                label: "HP",
                value: hp,
                max: hp
            },{
                label: "MP",
                value: mp,
                max: mp
            },{
                label: "SAN",
                value: san,
                max: san
            }],
            params: [{
                label: "STR",
                value: str
            },{
                label: "CON",
                value: con
            },{
                label: "POW",
                value: pow
            },{
                label: "DEX",
                value: dex
            },{
                label: "APP",
                value: app
            },{
                label: "SIZ",
                value: siz
            },{
                label: "INT",
                value: int
            },{
                label: "EDU",
                value: edu
            }]
        }
    };

    const npcDataString = JSON.stringify(npcData, null, 2);

    navigator.clipboard.writeText(npcDataString).then(function() {

        alert('NPCデータをクリップボードにコピーしました。');
    }).catch(function(error) {

        console.error('クリップボードにコピーできませんでした。', error);
        alert('クリップボードにコピーできませんでした。', error);
    });
});
 
document.getElementById('addSkill').addEventListener('click', function() {
    const skillsDiv            = document.getElementById('skills');
    const allSkills            = skillsDiv.querySelectorAll('.skillSet');
    const newSkillNumber       = allSkills.length + 1;

    const newSkillLabel        = document.createElement('label');
    newSkillLabel.textContent  = `技能${newSkillNumber}：`;
    newSkillLabel.htmlFor      = `skill${newSkillNumber}`;

    const newSkillInput        = document.createElement('input');
    newSkillInput.type         = 'text';
    newSkillInput.id           = `skill${newSkillNumber}`;
    newSkillInput.name         = `skill${newSkillNumber}`;
    newSkillInput.placeholder  = "技能名";
    newSkillInput.className    = "skillName";
    newSkillInput.autocomplete = "off"

    const newSkillValue        = document.createElement('input');
    newSkillValue.type         = 'number';
    newSkillValue.id           = `value${newSkillNumber}`;
    newSkillValue.name         = `value${newSkillNumber}`;
    newSkillValue.placeholder  = "技能成功値";
    newSkillValue.className    = "skillValue";
    newSkillValue.min          = "0";
    newSkillValue.max          = "100";
    newSkillValue.autocomplete = "off"

    const skillContainer       = document.createElement('div');
    skillContainer.className   = 'skillSet';

    skillContainer.appendChild(newSkillLabel);
    skillContainer.appendChild(newSkillInput);
    skillContainer.appendChild(newSkillValue);

    skillsDiv.appendChild(skillContainer);
});

function padString(str, length) {
    while (str.length < length) {
        str += ' ';
    }
    return str;
}

function damageBonus(str, siz) {
    const add = parseInt(str) + parseInt(siz);
    if      (2  <= add && add <= 12) return "-1d6";
    else if (13 <= add && add <= 16) return "-1d4";
    else if (17 <= add && add <= 24) return "+0";
    else if (25 <= add && add <= 32) return "+1d4";
    else if (33 <= add && add <= 40) return "+1d6";
    else                             return undefined;
}