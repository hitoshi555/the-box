import "./DynamicCSSChanger.css";
import React, { useEffect, useRef, useState } from 'react';


const validCSSProperties: string[] = [
  'width', 'height', 'backgroundColor', 'color', 'margin', 'padding', 'fontSize'
];

type StyleObject = Record<string, string | number>;

const DynamicCSSChanger: React.FC = () => {
  const [cssStrings, setCssStrings] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [style, setStyle] = useState<StyleObject>({ cursor: 'pointer' });
  const [isInputVisible, setIsInputVisible] = useState<boolean>(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (boxRef.current) {
      const box = boxRef.current.getBoundingClientRect();
      setPosition({ x: box.left, y: box.bottom + 10 }); // 最初のdivの下に位置を設定
    }
  }, []);

  useEffect(() => {
    // CSS 文字列を解析してスタイルオブジェクトに変換し、スタイルを更新
    const newStyle: StyleObject = parseCSS(cssStrings);
    setStyle(newStyle);
  }, [cssStrings]);


  // CSS 文字列を解析してスタイルオブジェクトに変換
  const parseCSS = (cssStrings: string[]): Record<string, string | number> => {
    const styleObject: Record<string, string | number> = {};

    cssStrings.forEach(cssString => {
      const [property, value] = cssString.split(':').map(s => s.trim());
      const jsProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      if (validCSSProperties.includes(jsProperty)) {
        styleObject[jsProperty as keyof React.CSSProperties] = value;
      }
    });

    cssStrings.forEach(cssString => {
      const [property, value] = cssString.split(':').map(s => s.trim());
      const jsProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      styleObject[jsProperty] = value;
    });
    return styleObject;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setError(''); // エラーメッセージをクリア
  };

  const handleAddCSS = () => {
    if (inputValue) {
      // 改行で分割して複数のCSSプロパティを取得
      const cssProperties = inputValue.split('\n').map(prop => {
        const cleanedProp = prop.replace(/,$/, '').trim();
        return cleanedProp;
      });
      let localError = '';

      // 分割された各CSSプロパティに対してループ処理
      cssProperties.forEach((cssProp, index) => {
        if (localError) return; // 既にエラーがあればそれ以上処理しない

        const [property, value] = cssProp.split(':').map(s => s.trim());
        const jsProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        // サポートされているCSSプロパティかチェック
        if (!validCSSProperties.includes(jsProperty)) {
          localError = `Error: Property "${property}","${index} is not valid or not supported.`;
          return;
        } else if (!value) {
          localError = `Error: "${property}" value is required.`;
          return;
        }

        // エラーがなければCSSプロパティを追加
        setCssStrings(prev => {
          const propertyIndex = prev.findIndex(item => item.startsWith(jsProperty + ':'));
          if (propertyIndex !== -1) {
            // プロパティが既に存在する場合は、その値を更新
            return prev.map((item, index) => index === propertyIndex ? `${jsProperty}: ${value}` : item);
          } else {
            // プロパティが存在しない場合は、新しいプロパティを追加
            return [...prev, `${jsProperty}: ${value}`];
          }
        });
      });

      if (localError) {
        setError(localError);
      } else {
        // エラーがなければエラーメッセージをクリア
        setError('');
      }
    }
  };

  // ドラッグ開始ハンドラー
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    // ドラッグ中の移動ハンドラー
    const handleDragging = (moveEvent: MouseEvent) => {
      setPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    // ドラッグ終了時のイベントリスナー解除
    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDragging);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleBoxClick = () => {
    setIsInputVisible(!isInputVisible);
    if (!isClicked) setIsClicked(true); // 最初のクリックで状態を更新
  };

  return (
    <div>
      {isInputVisible ? (
        <div
          style={{
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            backgroundColor: '#333', // ターミナル風の背景色
            color: 'white', // テキストの色
            fontFamily: 'monospace', // フォント
            zIndex: 1000, // 他の要素より前面に表示
            borderRadius: '10px', // 角丸
          }}
        >
          <div
            style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#555',
              borderRadius: '10px 10px 0 0',
              position: 'relative', // 子要素の絶対位置指定の基準となる
            }}
            onMouseDown={handleDragStart}
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); // ドラッグイベントの発火を防ぐ
                handleBoxClick();
              }}
              style={{
                position: 'absolute', // 親要素に対する絶対位置指定
                right: '0px', // 右端に配置
                top: '50%', // 上端から50%の位置に配置
                transform: 'translateY(-50%)', // Y軸方向に-50%ずらして中央に配置
                backgroundColor: '#555',
                color: 'white', // テキスト色
                borderRadius: '0 10px 0 0',// 円形にする
                border: 'none', // 枠線を非表示にする
                padding: '0 5px', // パディング
                marginRight: '5px', // 右側の余白
              }}
            >
              X
            </button>
          </div>
          <div style={{
            padding: '10px', // 内側の余白
            display: 'flex', // フレックスボックスを使用
            flexDirection: 'column', // 子要素を縦方向に並べる
          }}>
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter CSS (e.g., width: 50px)"
              style={{
                width: '300px', // 幅
                height: '100px', // 高さ
                backgroundColor: '#333',
                color: 'white',
                border: '1px solid #555', // 枠線のスタイル
                fontFamily: 'monospace',
                marginBottom: '5px', // textareaとbuttonの間の余白
              }}
            />
            <button onClick={handleAddCSS} style={{ alignSelf: 'flex-start', margin: "13px 0" }}>
              Add CSS
            </button>
            {error && <p style={{ color: 'red', textAlign: "left" }}>{error}</p>}
          </div>
        </div>
      ) : null}

      <div className={!isClicked ? 'sparkle' : ''} ref={boxRef} style={style} onClick={handleBoxClick}>
        <h1>The Box</h1>
      </div>
      {cssStrings.length > 0 && (
        <div>
          <h3>Applied CSS:</h3>
          <ul>
            {cssStrings.map((css, index) => (
              <li key={index}>{css}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DynamicCSSChanger;