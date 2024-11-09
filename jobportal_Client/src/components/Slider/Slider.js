import React from 'react';
import AwesomeSlider from 'react-awesome-slider';
import withAutoplay from 'react-awesome-slider/dist/autoplay';
import 'react-awesome-slider/dist/styles.css';
import './Slider.css';
import logo from '../../assets/images/common/logo.jpg';
import logo1 from '../../assets/images/common/logo1.jpg';

const AutoplaySlider = withAutoplay(AwesomeSlider);

const Slider = () => {
  const sliderSettings = {
    play: true,
    cancelOnInteraction: false,
    interval: 3000,
    bullets: true,
    organicArrows: true,
    animation: 'cubeAnimation',
    infinite: true,
  };

  const screens = [
    {
      media: logo,
      caption: 'Khám phá cơ hội việc làm hấp dẫn',
    },
    {
      media: logo1,
      caption: 'Tìm kiếm công việc phù hợp với bạn',
    },
    {
      media: logo,
      caption: 'Xây dựng sự nghiệp vững chắc',
    },
    {
      media: logo1,
      caption: 'Kết nối với nhà tuyển dụng hàng đầu',
    },
  ];

  return (
    <div className="slider-container">
      <AutoplaySlider className="awssld" {...sliderSettings}>
        {screens.map((item, index) => (
          <div key={index} data-src={item.media}>
            <div className="caption">
              <h2>{item.caption}</h2>
            </div>
          </div>
        ))}
      </AutoplaySlider>
    </div>
  );
};

export default Slider;