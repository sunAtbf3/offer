import React, { useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  fetchAllCategories,
  selectAllCategories,
  selectCategoriesLoading,
  selectCategoriesError,
} from '../REDUX_FEATURES/REDUX_SLICES/userCategoriesSlice';
import CategorySection from '../Homecompo/CategorySection';
import Categories from '../Homecompo/Categories';
import PriceBanners from '../Homecompo/PriceBanners';
import BestSellers from '../Homecompo/BestSellers';
import HeroSlider from '../Homecompo/HeroSlider';

const Homepage = () => {
  const dispatch = useDispatch();

  const categories = useSelector(selectAllCategories);

  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);
  const location = useLocation();

  // Single owner for category list: dispatch before paint so children do not
  // flash an empty state before Redux pending runs.
  useLayoutEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (location.hash === '#best-sellers') {
      document.getElementById('best-sellers')?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [location]);

  const showCategoryRows =
    !error.categories && !loading.categories && Array.isArray(categories) && categories.length > 0;

  return (
    <>
      <div className="px-4 md:px-8 pt-6">
        <HeroSlider />
      </div>

      <main className="container mx-auto px-4 pt- pb-20">
        <Categories />
        <PriceBanners />
        <section id="best-sellers">
          <BestSellers />
        </section>

        {showCategoryRows &&
          categories.map((cat) => (
            <CategorySection
              key={cat.slug}
              slug={cat.slug}
              title={cat.name}
            />
          ))}
      </main>
    </>
  );
};

export default Homepage;

// import React from 'react';
// // import HeroSection from '../components/Homecompo/HeroSection';
// import Categories from '../components/Homecompo/Categories';
// import PriceBanners from '../components/Homecompo/PriceBanners';
// // import TrustIndicators from '../components/Homecompo/TrustIndicators';
// import BestSellers from '../components/Homecompo/BestSellers';
// // import PromoSection from '../components/Homecompo/PromoSection';
// // import GiftPopup from '../components/USER_LOGIN_SEGMENT/GiftPopup';
// import HeroSlider from '../components/Homecompo/HeroSlider';
// import SmartlifeCategories from '../components/Homecompo/SmartlifeCategories';
// import HomeCategories from '../components/Homecompo/HomeCategories';
// import ToursCategories from '../components/Homecompo/ToursCategories';
// import BabyCategories from '../components/Homecompo/BabyCategories';



// const Homepage = () => {
//     return (
//         <>
//             <div className="px-4 md:px-8 pt-6">
//                 {/* <HeroSection /> */}
//                 <HeroSlider />
//             </div>

//             <main className="container mx-auto px-4 pt-12 pb-20 space-y-12">

//                 <Categories />
//                 <PriceBanners />
//                 {/* <TrustIndicators /> */}
//                 <BestSellers />

//                 {/*  AS WE DISCUS WE CREATE ONE COMPONENT AND THEN USE IT  */}
//                 <SmartlifeCategories />
//                 <HomeCategories />
//                 <ToursCategories />
//                 <BabyCategories />

//                 {/* <PromoSection /> */}
//             </main>
//         </>
//     );
// };

// export default Homepage;


// import React from 'react';
// import HeroSection from '../components/Homecompo/HeroSection';
// import Categories from '../components/Homecompo/Categories';
// import PriceBanners from '../components/Homecompo/PriceBanners';
// import TrustIndicators from '../components/Homecompo/TrustIndicators';
// import BestSellers from '../components/Homecompo/BestSellers';
// import PromoSection from '../components/Homecompo/PromoSection';

// const Homepage = () => {
//     return (
//         <>
//             <div className="px-4 md:px-8 pt-6">
//                 <HeroSection />
//             </div>

//             <main className="container mx-auto px-4 pt-12 pb-20 space-y-12">
//                 <Categories />
//                 <PriceBanners />
//                 <TrustIndicators />
//                 <BestSellers />
//                 <PromoSection />
//             </main>
//         </>
//     );
// };

// export default Homepage;
