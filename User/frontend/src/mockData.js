// Mock data for testing when APIs are not accessible
export const mockCategories = [
  {
    _id: "1",
    name: "Event Decoration",
    priority: 1,
    homeCategory: true,
    image: "https://res.cloudinary.com/drrlkntpx/image/upload/v1772015571/apna-decoration/categories/event-decoration.jpg",
    status: "active",
    description: "Complete event decoration services"
  },
  {
    _id: "2", 
    name: "Birthday Decoration",
    priority: 2,
    homeCategory: true,
    image: "https://res.cloudinary.com/drrlkntpx/image/upload/v1772015571/apna-decoration/categories/birthday-decoration.jpg",
    status: "active",
    description: "Birthday party decoration packages"
  },
  {
    _id: "3",
    name: "Wedding Decoration", 
    priority: 3,
    homeCategory: true,
    image: "https://res.cloudinary.com/drrlkntpx/image/upload/v1772015571/apna-decoration/categories/wedding-decoration.jpg",
    status: "active",
    description: "Wedding decoration services"
  },
  {
    _id: "4",
    name: "Festival Decoration",
    priority: 4, 
    homeCategory: true,
    image: "https://res.cloudinary.com/drrlkntpx/image/upload/v1772015571/apna-decoration/categories/festival-decoration.jpg",
    status: "active",
    description: "Festival special decorations"
  },
  {
    _id: "5",
    name: "Corporate Events",
    priority: 5,
    homeCategory: true,
    image: "https://res.cloudinary.com/drrlkntpx/image/upload/v1772015571/apna-decoration/categories/corporate-events.jpg",
    status: "active", 
    description: "Corporate event decoration"
  },
  {
    _id: "6",
    name: "Anniversary Decoration",
    priority: 6,
    homeCategory: true,
    image: "https://res.cloudinary.com/drrlkntpx/image/upload/v1772015571/apna-decoration/categories/anniversary-decoration.jpg", 
    status: "active",
    description: "Anniversary celebration decorations"
  }
];

export const mockProducts = [
  {
    _id: "1",
    name: "Birthday Decoration Package",
    description: "Complete birthday decoration with balloons, banners, and lights",
    price: 2999,
    category: "Birthday Decoration",
    images: ["https://res.cloudinary.com/drrlkntpx/image/upload/birthday-package.jpg"],
    status: "active"
  },
  {
    _id: "2", 
    name: "Wedding Flower Decoration",
    description: "Premium wedding flower decoration package",
    price: 9999,
    category: "Wedding Decoration",
    images: ["https://res.cloudinary.com/drrlkntpx/image/upload/wedding-flowers.jpg"],
    status: "active"
  },
  {
    _id: "3",
    name: "Festival Lights Package",
    description: "Colorful festival lights decoration set",
    price: 1999,
    category: "Festival Decoration", 
    images: ["https://res.cloudinary.com/drrlkntpx/image/upload/festival-lights.jpg"],
    status: "active"
  }
];

export const mockServiceCategories = [
  {
    _id: "1",
    name: "Event Planning",
    description: "Complete event planning services",
    icon: "🎉",
    image: "https://res.cloudinary.com/drrlkntpx/image/upload/event-planning.jpg"
  },
  {
    _id: "2",
    name: "Decoration Services", 
    description: "Professional decoration services",
    icon: "🎨",
    image: "https://res.cloudinary.com/drrlkntpx/image/upload/decoration-services.jpg"
  },
  {
    _id: "3",
    name: "Flower Arrangement",
    description: "Beautiful flower arrangements",
    icon: "💐",
    image: "https://res.cloudinary.com/drrlkntpx/image/upload/flower-arrangement.jpg"
  }
];
