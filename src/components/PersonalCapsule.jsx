import { useState } from "react";
import { Sparkles } from "lucide-react";
import headphonesUrl from "../assets/pocket-capsule/real-object-headphones.png";
import laptopUrl from "../assets/pocket-capsule/real-object-laptop.png";
import bikeUrl from "../assets/pocket-capsule/real-object-bike.png";
import puppyUrl from "../assets/pocket-capsule/real-object-puppy.png";
import controllerUrl from "../assets/pocket-capsule/real-object-controller.png";
import coffeeUrl from "../assets/pocket-capsule/real-object-coffee.png";

const capsuleItems = [
  {
    id: "headphones",
    label: "头戴式无线耳机",
    note: "慢慢听一会儿",
    image: headphonesUrl,
    x: "79%",
    y: "85%",
    tone: "peach",
    rotation: "-8deg",
    delay: "0.34s",
  },
  {
    id: "puppy",
    label: "田园犬奶狗",
    note: "软乎乎的同伴",
    image: puppyUrl,
    x: "20%",
    y: "86%",
    tone: "lavender",
    rotation: "7deg",
    delay: "0.4s",
  },
  {
    id: "bike",
    label: "山地自行车",
    note: "XDS · 去山野",
    image: bikeUrl,
    x: "11%",
    y: "13%",
    tone: "butter",
    rotation: "-5deg",
    delay: "0.46s",
  },
  {
    id: "laptop",
    label: "笔记本电脑",
    note: "Vibe Coding",
    image: laptopUrl,
    x: "88%",
    y: "19%",
    tone: "mint",
    rotation: "7deg",
    delay: "0.37s",
  },
  {
    id: "controller",
    label: "PS 游戏手柄",
    note: "偶尔闯关",
    image: controllerUrl,
    x: "5%",
    y: "49%",
    tone: "blue",
    rotation: "-7deg",
    delay: "0.43s",
  },
  {
    id: "coffee",
    label: "浓咖啡",
    note: "爱心拉花",
    image: coffeeUrl,
    x: "97%",
    y: "48%",
    tone: "coral",
    rotation: "5deg",
    delay: "0.49s",
  },
];

const trajectoryPaths = [
  "M480 380 C385 308 256 175 106 98",
  "M480 380 C350 360 190 350 48 372",
  "M480 380 C372 462 290 588 192 654",
  "M480 380 C584 302 711 192 845 144",
  "M480 380 C642 372 782 376 932 365",
  "M480 380 C582 476 655 584 758 644",
];

const PersonalCapsule = ({ activeItem, onSelectItem }) => {
  const [open, setOpen] = useState(false);

  const handleCapsuleToggle = () => {
    if (open) {
      onSelectItem(null);
    }

    setOpen((value) => !value);
  };

  return (
    <section
      className={`personal-capsule ${open ? "is-open" : ""}`}
      aria-label="Lulu 的个人物品胶囊"
    >
      <div className="capsule-heading">
        <span>LULU / POCKET CAPSULE</span>
        <strong>{open ? "PERSONAL THINGS · 6" : "SEALED · TAP TO OPEN"}</strong>
      </div>

      <div className="capsule-universe">
        <svg
          className="capsule-trajectories"
          viewBox="0 0 960 760"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {trajectoryPaths.map((path, index) => (
            <path
              key={path}
              d={path}
              pathLength="1"
              style={{ "--path-delay": `${0.08 + index * 0.045}s` }}
            />
          ))}
        </svg>

        <span className="capsule-orbit orbit-one" aria-hidden="true" />
        <span className="capsule-orbit orbit-two" aria-hidden="true" />

        {capsuleItems.map(
          ({ id, label, image, x, y, tone, rotation, delay }) => (
            <button
              className={`capsule-item capsule-item-${tone} ${
                activeItem === id ? "is-active" : ""
              }`}
              key={id}
              type="button"
              disabled={!open}
              aria-pressed={activeItem === id}
              aria-label={`查看${label}对应的 Lulu 形象`}
              onClick={() => onSelectItem(id)}
              style={{
                "--item-x": x,
                "--item-y": y,
                "--item-rotation": rotation,
                "--item-delay": delay,
              }}
            >
              <span className="capsule-item-art">
                <i aria-hidden="true" />
                <img src={image} alt="" draggable="false" />
              </span>
            </button>
          ),
        )}

        <button
          className="pocket-capsule"
          type="button"
          onClick={handleCapsuleToggle}
          aria-expanded={open}
          aria-label={open ? "收起个人物品胶囊" : "打开个人物品胶囊"}
        >
          <span className="capsule-half capsule-half-top">
            <i />
          </span>
          <span className="capsule-half capsule-half-bottom">
            <i />
          </span>
          <span className="capsule-center-label">
            <small>POCKET</small>
            <strong>H</strong>
            <em>{open ? "OPEN" : "TAP ME"}</em>
          </span>
          <span className="capsule-open-core" aria-hidden="true">
            <Sparkles />
          </span>
        </button>
      </div>

      <button
        className="capsule-toggle-copy"
        type="button"
        onClick={handleCapsuleToggle}
      >
        <span>
          {open
            ? activeItem
              ? "恭喜，你成功发现了隐藏彩蛋🎊！"
              : "Wow你成功了，能不能再玩出点新花样⁉️"
            : "试着打开胶囊，看看里面装了什么🌸？"}
        </span>
        <i>{open ? "CHOOSE A THING" : "OPEN POCKET"}</i>
      </button>
    </section>
  );
};

export default PersonalCapsule;
