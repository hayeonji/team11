import React, { useState, useEffect, useRef } from 'react';
import { wordGroups, imageGroups, wordOrder } from './data';
import './App.css';

const App = () => {
  const [hoveredWord, setHoveredWord] = useState(null);
  const [clickedWords, setClickedWords] = useState(Array(wordOrder.length).fill(''));
  const [clickCounts, setClickCounts] = useState(Array(wordOrder.length).fill(0));
  const [isSpinning, setIsSpinning] = useState(Array(wordOrder.length).fill(false));
  const [showImages, setShowImages] = useState(Array(wordOrder.length).fill(false));
  const [randomStyles, setRandomStyles] = useState(Array(wordOrder.length).fill({}));
  const [newTexts, setNewTexts] = useState([]); // 새로 생기는 텍스트를 관리하는 상태
  const wordRefs = useRef([]);
  const [displayedWords, setDisplayedWords] = useState(Array(wordOrder.length).fill('')); // 타이핑된 텍스트
  const [totalClicks, setTotalClicks] = useState(0); // 클릭 횟수 추적

  useEffect(() => {
    let delay = 0;

    // 타이핑 효과 함수
    const typeWord = (word, index) => {
      let typedText = '';
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        typedText += word[charIndex];
        setDisplayedWords((prev) => {
          const newDisplayedWords = [...prev];
          newDisplayedWords[index] = typedText; // 현재까지 타이핑된 텍스트 설정
          return newDisplayedWords;
        });
        charIndex++;
        if (charIndex >= word.length) clearInterval(typingInterval); // 단어가 다 타이핑되면 중지
      }, 100); // 타이핑 속도 설정
    };

    // 각 단어에 대해 순차적으로 타이핑 효과 적용
    wordOrder.forEach((word, index) => {
      setTimeout(() => {
        typeWord(word, index);
      }, delay);
      delay += 500; // 단어별 타이핑 시작 간격
    });
  }, []);

  const handleMouseEnter = (index) => setHoveredWord(index);
  const handleMouseLeave = () => setHoveredWord(null);

  const getPositionNearWord = (index, width, height) => {
    const wordElement = wordRefs.current[index];
    if (!wordElement) return { top: 0, left: 0 };
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const top = Math.random() * (screenHeight - height);
    const left = Math.random() * (screenWidth - width);

    return { top, left };
  };

  // 새로운 단어 추가 (랜덤하게 wordOrder에서 선택된 단어)
  const addRandomText = () => {
    const randomWord = wordOrder[Math.floor(Math.random() * wordOrder.length)]; // 랜덤한 단어 선택
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const randomTop = Math.random() * (screenHeight - 50); // 랜덤 위치 설정
    const randomLeft = Math.random() * (screenWidth - 200);

    setNewTexts((prevTexts) => [
      ...prevTexts,
      { word: randomWord, top: randomTop, left: randomLeft, isSpinning: false, clickCount: 0, showImage: false, randomStyle: {} },
    ]);
  };

  // 새로운 텍스트가 추가되었을 때의 클릭 핸들러
  const handleNewTextClick = (index, text) => {
    const wordKey = text.word;
    if (!wordGroups[wordKey] || text.isSpinning) return;

    const spinSound = new Audio(`${process.env.PUBLIC_URL}/sound/slot_machine_sound.mp3`);
    spinSound.play();

    let spinCount = 0;
    const interval = setInterval(() => {
      if (text.showImage) {
        const randomImage = imageGroups[wordKey][Math.floor(Math.random() * imageGroups[wordKey].length)];
        setNewTexts((prevTexts) => {
          const newTexts = [...prevTexts];
          newTexts[index].word = randomImage; // 이미지 경로를 저장하지 않고 이미지를 표시할 수 있도록 함
          newTexts[index].showImage = true; // 이미지가 보여질 상태로 설정
          return newTexts;
        });
      } else {
        const randomWord = wordGroups[wordKey][Math.floor(Math.random() * wordGroups[wordKey].length)];
        setNewTexts((prevTexts) => {
          const newTexts = [...prevTexts];
          newTexts[index].word = randomWord; // 단어를 저장
          return newTexts;
        });
      }

      spinCount += 1;

      if (spinCount >= 10) {
        clearInterval(interval);
        spinSound.pause();
        spinSound.currentTime = 0;

        const finalImage = imageGroups[wordKey][text.clickCount % imageGroups[wordKey].length];
        const finalWord = wordGroups[wordKey][text.clickCount % wordGroups[wordKey].length];

        const randomFontSize = `${Math.random() * (1.5 - 1.5) + 1.5}rem`;

        setNewTexts((prevTexts) => {
          const newTexts = [...prevTexts];
          const width = Math.random() * (400 - 100) + 100;
          const height = 'auto';
          const { top, left } = getPositionNearWord(index, width, 300);

          newTexts[index].randomStyle = {
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height,
            position: 'absolute',
            fontSize: randomFontSize,
          };

          newTexts[index].word = finalImage; // 최종 이미지로 변경
          newTexts[index].showImage = true;

          return newTexts;
        });
      }
    }, 100);
  };

  const handleClick = (index) => {
    const wordKey = wordOrder[index];
    if (!wordGroups[wordKey] || isSpinning[index]) return;

    setIsSpinning((prev) => {
      const newSpinning = [...prev];
      newSpinning[index] = true;
      return newSpinning;
    });

    const currentClickCount = clickCounts[index];
    const wordList = wordGroups[wordKey];
    const wordListLength = wordList.length;
    const imageList = imageGroups[wordKey];

    const spinSound = new Audio(`${process.env.PUBLIC_URL}/sound/slot_machine_sound.mp3`);
    spinSound.play();

    let spinCount = 0;
    const interval = setInterval(() => {
      if (showImages[index]) {
        const randomImage = imageList[Math.floor(Math.random() * imageList.length)];
        setClickedWords((prevWords) => {
          const newClickedWords = [...prevWords];
          newClickedWords[index] = randomImage;
          return newClickedWords;
        });
      } else {
        const randomWord = wordList[Math.floor(Math.random() * wordListLength)];
        setClickedWords((prevWords) => {
          const newClickedWords = [...prevWords];
          newClickedWords[index] = randomWord;
          return newClickedWords;
        });
      }

      spinCount += 1;

      if (spinCount >= 10) {
        clearInterval(interval);
        spinSound.pause();
        spinSound.currentTime = 0;

        const finalImage = imageList[currentClickCount % imageList.length];
        const finalWord = wordList[currentClickCount % wordListLength];

        const randomFontSize = `${Math.random() * (1.5 - 1.5) + 1.5}rem`;

        if (currentClickCount >= wordListLength) {
          const width = Math.random() * (400 - 100) + 100;
          const height = 'auto';
          const { top, left } = getPositionNearWord(index, width, 300);

          setRandomStyles((prevStyles) => {
            const newStyles = [...prevStyles];
            newStyles[index] = {
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height,
              position: 'absolute',
              fontSize: randomFontSize,
            };
            return newStyles;
          });

          setClickedWords((prevWords) => {
            const newClickedWords = [...prevWords];
            newClickedWords[index] = finalImage;
            return newClickedWords;
          });

          setShowImages((prev) => {
            const newShowImages = [...prev];
            newShowImages[index] = true;
            return newShowImages;
          });
        } else {
          setRandomStyles((prevStyles) => {
            const newStyles = [...prevStyles];
            newStyles[index] = {
              fontSize: randomFontSize,
            };
            return newStyles;
          });

          setClickedWords((prevWords) => {
            const newClickedWords = [...prevWords];
            newClickedWords[index] = finalWord;
            return newClickedWords;
          });
        }

        setClickCounts((prevCounts) => {
          const newCounts = [...prevCounts];
          newCounts[index] = prevCounts[index] + 1;
          return newCounts;
        });

        setIsSpinning((prev) => {
          const newSpinning = [...prev];
          newSpinning[index] = false;
          return newSpinning;
        });

        // 총 클릭 횟수가 10이 넘으면 매 클릭마다 새 텍스트 추가
        setTotalClicks((prevClicks) => {
          const newTotal = prevClicks + 1;
          if (newTotal >= 10) {
            addRandomText(); // 10번째 클릭 후부터 매번 텍스트 추가
          }
          return newTotal;
        });
      }
    }, 100);
  };

  return (
    <div className="app">
      <div className="word-container">
        {wordOrder.map((word, index) => (
          displayedWords[index] && (
            <span
              key={index}
              className={`word ${hoveredWord === index ? 'hover' : ''} ${isSpinning[index] ? 'spinning' : ''}`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(index)}
              ref={(el) => (wordRefs.current[index] = el)}
              style={showImages[index] ? randomStyles[index] : randomStyles[index]} // 글자 크기 적용
            >
              {showImages[index] ? (
                <img src={clickedWords[index]} alt="roulette result" style={{ width: '100%' }} />
              ) : (
                clickedWords[index] || word // 기본 단어 또는 클릭 후 결과 단어/이미지
              )}
            </span>
          )
        ))}

        {/* 새로 추가된 텍스트 출력 및 클릭 핸들러 */}
        {newTexts.map((text, index) => (
          <span
            key={index}
            className={`new-word ${text.isSpinning ? 'spinning' : ''}`}
            onClick={() => handleNewTextClick(index, text)}
            style={{
              position: 'absolute',
              top: `${text.top}px`,
              left: `${text.left}px`,
              color: 'white',
              fontSize: '1.5rem',
              ...text.randomStyle,
            }}
          >
            {text.showImage ? (
              <img src={text.word} alt="roulette result" style={{ width: '100%' }} /> // 이미지 표시
            ) : (
              text.word // 텍스트 표시
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default App;
