import React from 'react';
import AwesomeSlider from 'react-awesome-slider';
import withAutoplay from 'react-awesome-slider/dist/autoplay';
import 'react-awesome-slider/dist/styles.css';
import './Slider.css'; // Import CSS tùy chỉnh
import logo from '../../assets/images/common/logo.jpg';
import logo1 from '../../assets/images/common/logo1.jpg';
const AutoplaySlider = withAutoplay(AwesomeSlider);

const Slider = () => {
  return (
    <div className="slider-container">
      <AutoplaySlider
        play={true} 
        cancelOnInteraction={false} 
        interval={2500} 
      >
        <div data-src={logo}/>
        <div data-src={logo1} />
        <div data-src={logo}/>
        <div data-src={logo1} />
        <div data-src= {logo}/>
      </AutoplaySlider>
    </div>
  );
};

export default Slider;
