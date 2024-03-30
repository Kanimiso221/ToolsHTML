// 
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
                    if (p.textContent.includes('CCB') || p.textContent.includes('【正気度ロール】')) {
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

                // 結果の出力部分を修正
                let output = '';
                const maxLength = Math.max(...Object.keys(results).map(name => name.length));
                for (const [character, counts] of Object.entries(results)) {
                    const paddedName = padString(character, maxLength);
                    output += `${paddedName}: 1クリ[${counts['1クリ']}]・クリティカル[${counts['決定的成功']}]・成功[${counts['成功']}]・失敗[${counts['失敗']}]・ファンブル[${counts['致命的失敗']}]・100ファン[${counts['100ファン']}]・SANC成功[${counts['SANC成功']}]・SANC失敗[${counts['SANC失敗']}]<br>`;
                }

                resultDiv.innerHTML = output;
            };

            reader.readAsText(file);
        }
    });
});

// 文字列の長さを合わせる関数
function padString(str, length) {
    while (str.length < length) {
        str += ' ';
    }
    return str;
}
