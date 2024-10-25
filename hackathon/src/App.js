import React, { useState, useRef } from 'react';
import { wordGroups, imageGroups, soundGroups, wordOrder } from './data'; // 데이터 파일을 import
import './App.css';

const App = () => {
  const [hoveredWord, setHoveredWord] = useState(null);
  const [clickedWords, setClickedWords] = useState(wordOrder);
  const [clickCounts, setClickCounts] = useState(Array(wordOrder.length).fill(0));
  const [isSpinning, setIsSpinning] = useState(Array(wordOrder.length).fill(false));
  const [showImages, setShowImages] = useState(Array(wordOrder.length).fill(false));
  const wordRefs = useRef([]);

  const handleMouseEnter = (index) => setHoveredWord(index);
  const handleMouseLeave = () => setHoveredWord(null);

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
    const soundList = soundGroups[wordKey];
  
    const spinSound = new Audio(`${process.env.PUBLIC_URL}/sound/wheeloffortune1.wav`);
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
  
        if (currentClickCount >= wordListLength) {
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
          setClickedWords((prevWords) => {
            const newClickedWords = [...prevWords];
            newClickedWords[index] = finalWord;
            return newClickedWords;
          });
        }
  
        // 사운드 재생 로직 추가
        if (currentClickCount >= 5 && soundList && soundList.length > 0) {
          const sound = new Audio(soundList[currentClickCount % soundList.length]);
          sound.play();
        }
  
        setClickCounts((prevCounts) => {
          const newCounts = [...prevCounts];
          newCounts[index] = prevCounts[index] + 1;
          return newCounts;
        });
  
        // 크기가 일정 이상이면 large 클래스를 추가
        const isLarge = (100 + 70 * currentClickCount) >= 300;
        
        if (wordRefs.current[index]) {
          wordRefs.current[index].classList.toggle('large', isLarge); // large 클래스를 추가/제거
        }
  
        setIsSpinning((prev) => {
          const newSpinning = [...prev];
          newSpinning[index] = false;
          return newSpinning;
        });
      }
    }, 100);
  };
  

  return (
    <div className="app">
      <div className="word-container">
        {clickedWords.map((word, index) => (
          <span
            key={index}
            className={`word ${hoveredWord === index ? 'hover' : ''} ${isSpinning[index] ? 'spinning' : ''}`}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            ref={(el) => (wordRefs.current[index] = el)}
          >
            {showImages[index] ? (
              <img
                src={word}
                alt="roulette result"
                style={{
                  width: `${100 + 70 * clickCounts[index]}px`,
                  height: `${100 + 70 * clickCounts[index]}px`,
                  objectFit: 'cover',
                  aspectRatio: '1 / 1',
                  maxWidth: '100vw',
                  maxHeight: '100vh',
                }}
              />
            ) : (
              word
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default App;

