import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 每次路由變化時滾動到頂部
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
