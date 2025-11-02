// src/components/MainVisualSwiper.js
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function MainVisualSwiper({ bannerData }) {
  // Filter banners where banner_type starts with 'top'
  const topBanners = bannerData && Array.isArray(bannerData) 
    ? bannerData.filter(b => b.banner_type && b.banner_type.startsWith('top'))
    : [];

  return (
    <section className="is-kv is-kv-lower is-kv-lower-home swiper_clm-1">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        autoplay={{
          delay: 5000,
          stopOnLastSlide: true,
          disableOnInteraction: true,
          reverseDirection: false,
        }}
        loop={true}
        slidesPerView={1.3}
        spaceBetween={30}
        initialSlide={0}
        centeredSlides={true}
        watchOverflow={true}
        autoHeight={true}
        breakpoints={{
          980: {
            slidesPerView: 1.1,
            spaceBetween: 20,
          },
          767: {
            slidesPerView: 1.1,
            spaceBetween: 20,
          },
          420: {
            slidesPerView: 1.1,
            spaceBetween: 20,
          },
        }}
        className="my-swiper"
      >
        {topBanners.length > 0 ? (
          topBanners.map((banner, index) => (
            <SwiperSlide key={banner.banner_type || index}>
              <img src={banner.banner_url || `/images/home/cover-${index + 1}.png`} alt="" />
            </SwiperSlide>
          ))
        ) : (
          // 如果没有 banner 数据，显示默认图片
          <>
            {/* <SwiperSlide>
              <img src="/images/home/cover-1.png" alt="" className="pc" />
              <img src="/images/home/cover-1-sp.png" alt="" className="sp" />
            </SwiperSlide>
            <SwiperSlide>
              <img src="/images/home/cover-2.png" alt="" className="pc" />
              <img src="/images/home/cover-2-sp.png" alt="" className="sp" />
            </SwiperSlide>
            <SwiperSlide>
              <img src="/images/home/cover-3.png" alt="" className="pc" />
              <img src="/images/home/cover-3-sp.png" alt="" className="sp" />
            </SwiperSlide>
            <SwiperSlide>
              <img src="/images/home/cover-4.png" alt="" className="pc" />
              <img src="/images/home/cover-4-sp.png" alt="" className="sp" />
            </SwiperSlide>
            <SwiperSlide>
              <img src="/images/home/cover-5.png" alt="" className="pc" />
              <img src="/images/home/cover-5-sp.png" alt="" className="sp" />
            </SwiperSlide> */}
          </>
        )}
      </Swiper>
      <div className="swiper-button-prev"></div>
      <div className="swiper-button-next"></div>
      <div className="swiper-pagination"></div>
    </section>
  );
}