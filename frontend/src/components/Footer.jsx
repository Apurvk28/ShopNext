import React from 'react';
import FuzzyCritterFooter from '@/components/ui/fuzzy-critter-footer';

const Footer = () => {
  return (
    <FuzzyCritterFooter
      wordmark="ShopNext"
      name="ShopNext"
      logoSrc="/SmallSquareLogoJpg.jpg"
      tagline="Premium E-Commerce Platform. Curated essentials and modern apparel."
      copyright={`© ${new Date().getFullYear()} ShopNext. All rights reserved.`}
      columns={[
        {
          title: 'Shop',
          links: [
            { label: 'All Products', href: '/shop' },
            { label: 'Shopping Cart', href: '/cart' },
            { label: 'Checkout', href: '/checkout' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About Us', href: '/about' },
            { label: 'Return Policy', href: '/return' },
            { label: 'Disclaimer', href: '/disclaimer' },
          ],
        },
        {
          title: 'Account',
          links: [
            { label: 'My Profile', href: '/profile' },
            { label: 'Login', href: '/login' },
            { label: 'Sign Up', href: '/register' },
          ],
        },
      ]}
      legal={[
        { label: 'Return Policy', href: '/return' },
        { label: 'Disclaimer', href: '/disclaimer' },
      ]}
    />
  );
};

export default Footer;
