import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import CustomerLayout from "../components/customer/Layout";
import HeroSection from "../components/customer/HeroSection";
import TourCard from "../components/customer/TourCard";
import CustomSelect from "../components/common/CustomSelect";
import { apiRequest } from "../lib/api";
const FALLBACK_DEST = [
    {
        Name: "Hạ Long",
        Slug: "ha-long",
        Province: "Quảng Ninh",
        ImageUrl: "/uploads/halong_bay_tour_1782322278488-card.webp",
        TourCount: 18
    },
    {
        Name: "Hội An",
        Slug: "hoi-an",
        Province: "Quảng Nam",
        ImageUrl: "/uploads/hoi_an_dest_1782322685125-card.webp",
        TourCount: 10
    },
    {
        Name: "Phú Quốc",
        Slug: "phu-quoc",
        Province: "Kiên Giang",
        ImageUrl: "/uploads/phu_quoc_tour_1782322289095-card.webp",
        TourCount: 16
    },
    {
        Name: "Ninh Bình",
        Slug: "ninh-binh",
        Province: "Ninh Bình",
        ImageUrl: "/uploads/ninh_binh_dest_1782322714824-card.webp",
        TourCount: 12
    },
    {
        Name: "Huế",
        Slug: "hue",
        Province: "Thừa Thiên Huế",
        ImageUrl: "/uploads/hoi_an_dest_1782322685125-card.webp",
        TourCount: 14
    },
    {
        Name: "Đà Nẵng",
        Slug: "da-nang",
        Province: "Đà Nẵng",
        ImageUrl: "/uploads/phu_quoc_tour_1782322289095-card.webp",
        TourCount: 15
    }
];
const CATEGORY_SHOWCASE = [
    {
        image: "/uploads/d1.webp",
        accent: "Trong Nước",
        summary: "Lịch trình du lịch văn hóa truyền thống, thắng cảnh và bản sắc Việt Nam."
    },
    {
        image: "/uploads/d2.webp",
        accent: "Nghỉ Dưỡng",
        summary: "Trải nghiệm dịch vụ 5 sao, thư giãn thư thái tại các bãi biển đẹp nhất."
    },
    {
        image: "/uploads/d3.webp",
        accent: "Gia Đình",
        summary: "Hành trình gắn kết, tạo kỷ niệm vui vẻ đong đầy cảm xúc cho gia đình."
    },
    {
        image: "/uploads/d4.webp",
        accent: "Tâm Linh",
        summary: "Tìm lại sự an yên trong tâm hồn qua các hành trình di sản tâm linh thiêng liêng."
    },
    {
        image: "/uploads/d5.webp",
        accent: "Mạo Hiểm",
        summary: "Chinh phục giới hạn bản thân với các tour leo núi, khám phá hang động kỳ vĩ."
    },
    {
        image: "/uploads/d6.webp",
        accent: "Ẩm Thực",
        summary: "Khám phá tinh hoa ẩm thực ba miền và văn hóa ẩm thực đặc sắc."
    }
];
const DESTINATION_SHOWCASE_COPY = [
    {
        tone: "forest",
        eyebrow: "Chạm vào xanh thẳm"
    },
    {
        tone: "lagoon",
        eyebrow: "Trôi giữa bình yên"
    },
    {
        tone: "heritage",
        eyebrow: "Nghe miền di sản kể"
    },
    {
        tone: "cliff",
        eyebrow: "Đi tìm điều kỳ diệu"
    },
    {
        tone: "island",
        eyebrow: "Hẹn với biển trời"
    },
    {
        tone: "night",
        eyebrow: "Thành phố lên đèn"
    }
];
const INSTA_EXPLORE_POSTS = [
    {
        id: 1,
        image: "/uploads/ks1.webp",
        likes: "4.8k",
        comments: "284",
        caption: "🏨 VietTravel Premium Stay - Hệ sinh thái khách sạn đẳng cấp hàng đầu."
    },
    {
        id: 2,
        image: "/uploads/ks2.webp",
        likes: "3.2k",
        comments: "192",
        caption: "🏨 VietTravel Boutique Hotel - Trải nghiệm không gian nghỉ dưỡng ấm cúng."
    },
    {
        id: 3,
        image: "/uploads/ks3.webp",
        likes: "5.1k",
        comments: "342",
        caption: "🏨 VietTravel Luxury Suites - Nơi thư giãn lý tưởng cho mỗi chuyến đi."
    },
    {
        id: 4,
        image: "/uploads/x1.webp",
        likes: "6.4k",
        comments: "512",
        caption: "🌴 VietTravel Resort & Villas - Hệ sinh thái resort xanh mát bên bờ cát trắng."
    },
    {
        id: 5,
        image: "/uploads/x2.webp",
        likes: "3.6k",
        comments: "175",
        caption: "🌴 VietTravel Eco Lodge - Đắm mình cùng thiên nhiên đất nước bình yên."
    },
    {
        id: 6,
        image: "/uploads/t1.webp",
        likes: "2.9k",
        comments: "185",
        caption: "🚢 VietTravel Tour - Khám phá miền đất hứa cùng những hành trình đầy cảm xúc."
    },
    {
        id: 7,
        image: "/uploads/t2.webp",
        likes: "4.2k",
        comments: "298",
        caption: "✈️ VietTravel Cruise & Flight - Hệ sinh thái di chuyển và trải nghiệm tour đa dạng."
    },
    {
        id: 8,
        image: "/uploads/phu_quoc_tour_1782322289095.webp",
        likes: "3.8k",
        comments: "250",
        caption: "🌴 Trải nghiệm biển đảo tuyệt vời cùng hệ thống resort nghỉ dưỡng Phú Quốc."
    },
    {
        id: 9,
        image: "/uploads/halong_bay_tour_1782322278488.webp",
        likes: "5.5k",
        comments: "408",
        caption: "🚢 Du thuyền đẳng cấp khám phá non nước Việt Nam kỳ vĩ."
    }
];
const INSTA_PROFILE_POSTS = [
    {
        id: 1,
        image: "/uploads/l1.webp",
        likes: "1.2k",
        comments: "95"
    },
    {
        id: 2,
        image: "/uploads/l2.webp",
        likes: "2.4k",
        comments: "180"
    },
    {
        id: 3,
        image: "/uploads/l3.webp",
        likes: "3.1k",
        comments: "225"
    },
    {
        id: 4,
        image: "/uploads/ks1.webp",
        likes: "940",
        comments: "60"
    },
    {
        id: 5,
        image: "/uploads/x1.webp",
        likes: "1.5k",
        comments: "110"
    },
    {
        id: 6,
        image: "/uploads/t1.webp",
        likes: "1.8k",
        comments: "142"
    }
];

const VIDEO_DESTINATIONS = [
  { id: 1, name: 'Đà Nẵng', slug: 'da-nang', videoUrl: 'https://pub-78113bc2e7004c3696034a6ae8584645.r2.dev/dnang.mp4' },
  { id: 2, name: 'Hạ Long', slug: 'ha-long', videoUrl: 'https://pub-78113bc2e7004c3696034a6ae8584645.r2.dev/hlong.mp4' },
  { id: 3, name: 'Hà Nội', slug: 'ha-noi', videoUrl: 'https://pub-78113bc2e7004c3696034a6ae8584645.r2.dev/hnoi.mp4' },
  { id: 4, name: 'Huế', slug: 'hue', videoUrl: 'https://pub-78113bc2e7004c3696034a6ae8584645.r2.dev/hue.mp4' },
  { id: 5, name: 'Ninh Bình', slug: 'ninh-binh', videoUrl: 'https://pub-78113bc2e7004c3696034a6ae8584645.r2.dev/nbinh.mp4' },
  { id: 6, name: 'Nha Trang', slug: 'nha-trang', videoUrl: 'https://pub-78113bc2e7004c3696034a6ae8584645.r2.dev/ntrang.mp4' },
  { id: 7, name: 'Vũng Tàu', slug: 'vung-tau', videoUrl: 'https://pub-78113bc2e7004c3696034a6ae8584645.r2.dev/vtau.mp4' },
];

export default function HomePage() {
    var _featuredCategories_activeIndex, _featuredCategories_activeIndex1;
    const router = useRouter();
    const featuredShowcaseRef = useRef(null);
    const [featured, setFeatured] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [dashboardTab, setDashboardTab] = useState("home");
    const [featuredSearch, setFeaturedSearch] = useState({
        destination: "",
        duration: "",
        maxPrice: "",
        sort: "rating"
    });
    const [promoForm, setPromoForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        promoCode: ""
    });
    const [promoMessage, setPromoMessage] = useState("");
    const [promoSuccess, setPromoSuccess] = useState(false);
    const [promoLoading, setPromoLoading] = useState(false);
    const handlePromoSubmit = async (e)=>{
        e.preventDefault();
        if (!promoForm.fullName || !promoForm.email) {
            setPromoMessage("Vui lòng nhập đầy đủ họ tên và email.");
            setPromoSuccess(false);
            return;
        }
        setPromoLoading(true);
        setPromoMessage("");
        try {
            const res = await apiRequest("/tours/contact", {
                method: "POST",
                body: JSON.stringify(promoForm)
            });
            if (res.ok) {
                setPromoSuccess(true);
                setPromoMessage("🎉 Đăng ký thành công! Thông tin ưu đãi đã được gửi đi.");
                setPromoForm({
                    fullName: "",
                    email: "",
                    phone: "",
                    promoCode: ""
                });
            } else {
                var _res_data;
                setPromoSuccess(false);
                setPromoMessage(((_res_data = res.data) === null || _res_data === void 0 ? void 0 : _res_data.message) || "Có lỗi xảy ra, vui lòng thử lại.");
            }
        } catch (err) {
            setPromoSuccess(false);
            setPromoMessage("Lỗi hệ thống, vui lòng thử lại sau.");
        } finally{
            setPromoLoading(false);
        }
    };

    const [videoIndex, setVideoIndex] = useState(0);
    const [isPlayingMap, setIsPlayingMap] = useState({});
    const [loadedVideoMap, setLoadedVideoMap] = useState({
        0: true,
        1: true,
        2: true
    });
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [shouldLoadScenicVideo, setShouldLoadScenicVideo] = useState(false);
    const [shouldPlayScenicVideo, setShouldPlayScenicVideo] = useState(false);
    const videoRefs = useRef([]);
    const destinationsSectionRef = useRef(null);
    const manualVideoActionRef = useRef(false);
    const summerBannerRef = useRef(null);
    const summerVideoRef = useRef(null);

    const primeVisibleVideos = (centerIndex)=>{
        setLoadedVideoMap((current)=>{
            const next = {
                ...current
            };
            [
                -2,
                -1,
                0,
                1,
                2
            ].forEach((offset)=>{
                const idx = (centerIndex + offset + VIDEO_DESTINATIONS.length) % VIDEO_DESTINATIONS.length;
                next[idx] = true;
            });
            return next;
        });
    };

    const playVideo = async (idx, options = {}) => {
        const { withSound = false } = options;
        primeVisibleVideos(idx);
        // Pause other videos
        videoRefs.current.forEach((video, i) => {
            if (i !== idx && video) {
                video.pause();
                video.muted = true;
                video.volume = 0;
                setIsPlayingMap(prev => ({ ...prev, [i]: false }));
            }
        });

        const activeVideo = videoRefs.current[idx];
        if (activeVideo) {
            try {
                activeVideo.volume = withSound ? 0.5 : 0;
                activeVideo.muted = !withSound;
                await activeVideo.play();
                setIsPlayingMap(prev => ({ ...prev, [idx]: true }));
            } catch (err) {
                if (withSound) {
                    console.log("Video with sound was blocked, retrying muted fallback:", err);
                    activeVideo.muted = true;
                    activeVideo.volume = 0;
                    try {
                        await activeVideo.play();
                        setIsPlayingMap(prev => ({ ...prev, [idx]: true }));
                    } catch (fallbackErr) {
                        console.log("Fallback muted autoplay failed:", fallbackErr);
                    }
                }
            }
        }
    };

    const pauseAllVideos = () => {
        videoRefs.current.forEach((video, i) => {
            if (video) {
                video.pause();
                video.muted = true;
                video.volume = 0;
                setIsPlayingMap(prev => ({ ...prev, [i]: false }));
            }
        });
    };

    const handleNextVideo = () => {
        const nextIdx = (videoIndex + 1) % VIDEO_DESTINATIONS.length;
        manualVideoActionRef.current = true;
        setVideoIndex(nextIdx);
        playVideo(nextIdx, { withSound: true });
    };

    const handlePrevVideo = () => {
        const prevIdx = (videoIndex - 1 + VIDEO_DESTINATIONS.length) % VIDEO_DESTINATIONS.length;
        manualVideoActionRef.current = true;
        setVideoIndex(prevIdx);
        playVideo(prevIdx, { withSound: true });
    };

    const handleVideoCardClick = (idx) => {
        if (idx === videoIndex) {
            const video = videoRefs.current[idx];
            if (video) {
                if (video.muted && !video.paused) {
                    video.muted = false;
                    video.volume = 0.5;
                    setIsPlayingMap(prev => ({ ...prev, [idx]: true }));
                } else if (video.paused) {
                    playVideo(idx, { withSound: true });
                } else {
                    video.pause();
                    setIsPlayingMap(prev => ({ ...prev, [idx]: false }));
                }
            }
        } else {
            manualVideoActionRef.current = true;
            setVideoIndex(idx);
            playVideo(idx, { withSound: true });
        }
    };

    // IntersectionObserver to watch destinations section visibility
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                setIsIntersecting(entry.isIntersecting);
            },
            { threshold: 0.35 }
        );

        const targetSection = destinationsSectionRef.current;
        if (targetSection) observer.observe(targetSection);

        return () => {
            if (targetSection) observer.unobserve(targetSection);
        };
    }, []);

    useEffect(()=>{
        primeVisibleVideos(videoIndex);
    }, [
        videoIndex
    ]);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                const nearViewport = entry.isIntersecting || entry.boundingClientRect.top < (window.innerHeight * 1.25);
                setShouldLoadScenicVideo(nearViewport);
                setShouldPlayScenicVideo(entry.isIntersecting);
            },
            {
                threshold: 0.45,
                rootMargin: "180px 0px"
            }
        );

        const target = summerBannerRef.current;
        if (target) observer.observe(target);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const video = summerVideoRef.current;
        if (!video || !shouldLoadScenicVideo) return undefined;

        if (shouldPlayScenicVideo) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {});
            }
        } else {
            video.pause();
        }

        return undefined;
    }, [shouldLoadScenicVideo, shouldPlayScenicVideo]);

    // Play/Pause active video when active slide index or visibility changes
    useEffect(() => {
        if (isIntersecting) {
            if (manualVideoActionRef.current) {
                manualVideoActionRef.current = false;
                return;
            }
            playVideo(videoIndex);
        } else {
            pauseAllVideos();
        }
    }, [videoIndex, isIntersecting]);

    useEffect(()=>{
        (async ()=>{
            var _destinationRes_data_data;
            const [tourRes, destinationRes, categoryRes] = await Promise.all([
                apiRequest("/tours/featured"),
                apiRequest("/destinations"),
                apiRequest("/categories")
            ]);
            if (tourRes.ok) setFeatured(tourRes.data.data || []);
            if (destinationRes.ok && ((_destinationRes_data_data = destinationRes.data.data) === null || _destinationRes_data_data === void 0 ? void 0 : _destinationRes_data_data.length)) {
                setDestinations(destinationRes.data.data.slice(0, 8));
            } else {
                setDestinations(FALLBACK_DEST);
            }
            if (categoryRes.ok) setCategories(categoryRes.data.data || []);
            setLoading(false);
        })();
    }, []);
    useEffect(()=>{
        if ("object" === "undefined") return undefined;
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        let rafId = 0;
        const applySearchDepth = ()=>{
            rafId = 0;
            const node = featuredShowcaseRef.current;
            if (!node) return;
            if (mediaQuery.matches) {
                node.style.setProperty("--search-offset", "46px");
                node.style.setProperty("--search-depth", "54px");
                node.style.setProperty("--search-tilt", "0deg");
                node.style.setProperty("--search-scale", "1");
                node.style.setProperty("--search-alpha", "1");
                node.style.setProperty("--search-blur", "24px");
                node.style.setProperty("--search-shadow", "0.34");
                node.style.setProperty("--search-reveal", "1");
                return;
            }
            const rect = node.getBoundingClientRect();
            const viewportHeight = window.innerHeight || 1;
            const start = viewportHeight * 0.98;
            const end = viewportHeight * 0.12;
            const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
            const eased = 1 - (1 - progress) * (1 - progress) * (1 - progress);
            const reveal = Math.max(0.38, Math.min(1, 0.38 + (progress - 0.08) / 0.92 * 0.62));
            const offsetMax = window.innerWidth <= 768 ? 52 : 40;
            const depthMax = window.innerWidth <= 768 ? 62 : 88;
            node.style.setProperty("--search-offset", "".concat(Math.round(eased * offsetMax), "px"));
            node.style.setProperty("--search-depth", "".concat(Math.round(eased * depthMax), "px"));
            node.style.setProperty("--search-tilt", "".concat(((1 - eased) * 24).toFixed(2), "deg"));
            node.style.setProperty("--search-scale", (0.88 + eased * 0.12).toFixed(3));
            node.style.setProperty("--search-alpha", (0.84 + reveal * 0.16).toFixed(3));
            node.style.setProperty("--search-blur", "".concat((18 + reveal * 12).toFixed(1), "px"));
            node.style.setProperty("--search-shadow", (0.16 + reveal * 0.24).toFixed(3));
            node.style.setProperty("--search-reveal", reveal.toFixed(3));
        };
        const requestApply = ()=>{
            if (!rafId) rafId = requestAnimationFrame(applySearchDepth);
        };
        requestApply();
        window.addEventListener("lenis:scroll", requestApply);
        window.addEventListener("scroll", requestApply, {
            passive: true
        });
        window.addEventListener("resize", requestApply);
        mediaQuery.addEventListener("change", requestApply);
        return ()=>{
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener("lenis:scroll", requestApply);
            window.removeEventListener("scroll", requestApply);
            window.removeEventListener("resize", requestApply);
            mediaQuery.removeEventListener("change", requestApply);
        };
    }, []);
    const baseCategories = categories.slice(0, 6);
    // Pad with mock items if we have fewer than 6 categories in database to show all 6 d1-d6 cards
    const mockNames = [
        "Tour Gia Đình",
        "Tour Mạo Hiểm",
        "Tour Nghỉ Dưỡng",
        "Tour Khám Phá",
        "Tour Cặp Đôi",
        "Tour Xuyên Việt"
    ];
    const mockSlugs = [
        "gia-dinh",
        "mao-hiem",
        "nghi-duong",
        "kham-pha",
        "cap-doi",
        "xuyen-viet"
    ];
    while(baseCategories.length < 6 && baseCategories.length > 0){
        const nextIdx = baseCategories.length;
        baseCategories.push({
            CategoryId: "mock-cat-".concat(nextIdx),
            Name: mockNames[nextIdx] || "Tour Trải Nghiệm",
            Slug: mockSlugs[nextIdx] || "trai-nghiem"
        });
    }
    const featuredCategories = baseCategories.map((category, index)=>({
            ...category,
            visual: CATEGORY_SHOWCASE[index % CATEGORY_SHOWCASE.length]
        }));
    // Auto-play categories carousel rotation
    useEffect(()=>{
        if (featuredCategories.length === 0) return;
        const interval = setInterval(()=>{
            setActiveIndex((current)=>(current + 1) % featuredCategories.length);
        }, 4500);
        return ()=>clearInterval(interval);
    }, [
        featuredCategories.length
    ]);
    const getVisibleItems = ()=>{
        if (featuredCategories.length === 0) return [];
        const n = featuredCategories.length;
        const slots = [
            -2,
            -1,
            0,
            1,
            2
        ];
        return slots.map((offset)=>{
            const idx = (activeIndex + offset + n * 2) % n;
            return {
                ...featuredCategories[idx],
                originalIndex: idx
            };
        });
    };
    const featuredHeroTour = featured[0];
    const destinationOptions = destinations.filter((destination)=>destination === null || destination === void 0 ? void 0 : destination.Slug).slice(0, 8).map((destination)=>({
            value: destination.Slug,
            label: destination.Name,
            description: destination.Province || destination.Country || ""
        }));
    const durationOptions = [
        {
            value: "",
            label: "Chọn số ngày"
        },
        {
            value: "1-3",
            label: "1 - 3 ngày",
            description: "Đi ngắn ngày, linh hoạt cuối tuần"
        },
        {
            value: "4-7",
            label: "4 - 7 ngày",
            description: "Khoảng nghỉ phổ biến nhất"
        },
        {
            value: "8+",
            label: "Trên 8 ngày",
            description: "Hành trình dài và sâu hơn"
        }
    ];
    const priceOptions = [
        {
            value: "",
            label: "Chọn mức giá"
        },
        {
            value: "3000000",
            label: "Dưới 3 triệu",
            description: "Tiết kiệm và dễ chốt nhanh"
        },
        {
            value: "5000000",
            label: "Dưới 5 triệu",
            description: "Cân bằng giữa giá và trải nghiệm"
        },
        {
            value: "10000000",
            label: "Dưới 10 triệu",
            description: "Phù hợp nhóm tour chất lượng cao"
        }
    ];
    const sortOptions = [
        {
            value: "rating",
            label: "Đánh giá cao",
            description: "Ưu tiên tour được yêu thích"
        },
        {
            value: "price_asc",
            label: "Giá tốt nhất",
            description: "Sắp xếp giá thấp đến cao"
        },
        {
            value: "newest",
            label: "Lịch mới nhất",
            description: "Ưu tiên lịch khởi hành mới"
        },
        {
            value: "price_desc",
            label: "Cao cấp hơn",
            description: "Ưu tiên tour phân khúc cao"
        }
    ];
    const destinationShowcase = destinations.slice(0, 6).map((destination, index)=>({
            ...destination,
            visual: DESTINATION_SHOWCASE_COPY[index % DESTINATION_SHOWCASE_COPY.length]
        }));
    const handleFeaturedSearchChange = (field)=>(event)=>{
            setFeaturedSearch((current)=>({
                    ...current,
                    [field]: event.target.value
                }));
        };
    const submitFeaturedSearch = (event)=>{
        event.preventDefault();
        const query = {};
        if (featuredSearch.destination) query.destination = featuredSearch.destination;
        if (featuredSearch.duration) query.duration = featuredSearch.duration;
        if (featuredSearch.maxPrice) query.maxPrice = featuredSearch.maxPrice;
        if (featuredSearch.sort) query.sort = featuredSearch.sort;
        router.push({
            pathname: "/tours",
            query
        });
    };
    const handleSlidePrev = ()=>{
        if (featuredCategories.length === 0) return;
        setActiveIndex((prev)=>(prev - 1 + featuredCategories.length) % featuredCategories.length);
    };
    const handleSlideNext = ()=>{
        if (featuredCategories.length === 0) return;
        setActiveIndex((prev)=>(prev + 1) % featuredCategories.length);
    };
    return /*#__PURE__*/ _jsxs(CustomerLayout, {
        title: "VietTravel - Khám Phá Việt Nam",
        children: [
            /*#__PURE__*/ _jsx(HeroSection, {
                tours: featured,
                loading: loading
            }),
            /*#__PURE__*/ _jsx("section", {
                className: "section categories-section",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "dashboard-container",
                    children: [
                        /*#__PURE__*/ _jsx("div", {
                            className: "dashboard-blur-bg",
                            style: {
                                backgroundImage: "url('/uploads/123.webp')"
                            }
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "dashboard-overlay"
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "dashboard-search-bar",
                            children: [
                                /*#__PURE__*/ _jsx("div", {
                                    className: "search-slider-pill",
                                    children: /*#__PURE__*/ _jsx("span", {
                                        className: "slider-arrow",
                                        children: /*#__PURE__*/ _jsx("i", {
                                            className: "fa-solid fa-chevron-right"
                                        })
                                    })
                                }),
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "search-address-pill",
                                    children: [
                                        /*#__PURE__*/ _jsx("i", {
                                            className: "fa-solid fa-magnifying-glass search-bar-icon"
                                        }),
                                        /*#__PURE__*/ _jsx("span", {
                                            className: "search-bar-text",
                                            children: "https://vietravel.brandgens.com"
                                        }),
                                        /*#__PURE__*/ _jsx("i", {
                                            className: "fa-solid fa-microphone search-bar-mic"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "search-options-pill",
                                    children: [
                                        /*#__PURE__*/ _jsx("button", {
                                            type: "button",
                                            className: "search-circle-btn",
                                            children: /*#__PURE__*/ _jsx("i", {
                                                className: "fa-solid fa-plus"
                                            })
                                        }),
                                        /*#__PURE__*/ _jsx("button", {
                                            type: "button",
                                            className: "search-circle-btn",
                                            children: /*#__PURE__*/ _jsx("i", {
                                                className: "fa-solid fa-share-nodes"
                                            })
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "dashboard-main-content",
                            children: [
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "dashboard-sidebar",
                                    children: [
                                        /*#__PURE__*/ _jsx("button", {
                                            type: "button",
                                            className: "sidebar-icon-btn ".concat(dashboardTab === "home" ? "active" : ""),
                                            onClick: ()=>setDashboardTab("home"),
                                            "aria-label": "Home slider",
                                            children: /*#__PURE__*/ _jsx("i", {
                                                className: "fa-solid fa-house"
                                            })
                                        }),
                                        /*#__PURE__*/ _jsx("button", {
                                            type: "button",
                                            className: "sidebar-icon-btn ".concat(dashboardTab === "explore" ? "active" : ""),
                                            onClick: ()=>setDashboardTab("explore"),
                                            "aria-label": "Instagram explore",
                                            children: /*#__PURE__*/ _jsx("i", {
                                                className: "fa-solid fa-globe"
                                            })
                                        }),
                                        /*#__PURE__*/ _jsx("button", {
                                            type: "button",
                                            className: "sidebar-icon-btn ".concat(dashboardTab === "profile" ? "active" : ""),
                                            onClick: ()=>setDashboardTab("profile"),
                                            "aria-label": "Instagram profile",
                                            children: /*#__PURE__*/ _jsx("i", {
                                                className: "fa-solid fa-user"
                                            })
                                        })
                                    ]
                                }),
                                dashboardTab === "home" && /*#__PURE__*/ _jsxs(_Fragment, {
                                    children: [
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "dashboard-carousel-track",
                                            children: getVisibleItems().map((item, index)=>{
                                                const isCenter = index === 2;
                                                return /*#__PURE__*/ _jsx("div", {
                                                    className: "dashboard-card slot-".concat(index, " ").concat(isCenter ? "active-center" : ""),
                                                    onClick: ()=>setActiveIndex(item.originalIndex),
                                                    role: "button",
                                                    tabIndex: 0,
                                                    onKeyDown: (event)=>{
                                                        if (event.key === "Enter" || event.key === " ") {
                                                            event.preventDefault();
                                                            setActiveIndex(item.originalIndex);
                                                        }
                                                    },
                                                    children: /*#__PURE__*/ _jsx("img", {
                                                        src: item.visual.image,
                                                        alt: item.Name,
                                                        loading: "lazy"
                                                    })
                                                }, "".concat(item.CategoryId, "-").concat(index));
                                            })
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "dashboard-next-control",
                                            children: /*#__PURE__*/ _jsx("button", {
                                                type: "button",
                                                className: "dashboard-next-btn",
                                                onClick: handleSlideNext,
                                                "aria-label": "Next Theme",
                                                children: /*#__PURE__*/ _jsx("i", {
                                                    className: "fa-solid fa-arrow-right"
                                                })
                                            })
                                        })
                                    ]
                                }),
                                dashboardTab === "explore" && /*#__PURE__*/ _jsx("div", {
                                    className: "insta-explore-container",
                                    children: /*#__PURE__*/ _jsx("div", {
                                        className: "insta-grid",
                                        children: INSTA_EXPLORE_POSTS.map((post)=>/*#__PURE__*/ _jsxs("div", {
                                                className: "insta-grid-item",
                                                children: [
                                                    /*#__PURE__*/ _jsx("img", {
                                                        src: post.image,
                                                        alt: "Post ".concat(post.id)
                                                    }),
                                                    /*#__PURE__*/ _jsxs("div", {
                                                        className: "insta-item-overlay",
                                                        children: [
                                                            /*#__PURE__*/ _jsxs("span", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsx("i", {
                                                                        className: "fa-solid fa-heart"
                                                                    }),
                                                                    " ",
                                                                    post.likes
                                                                ]
                                                            }),
                                                            /*#__PURE__*/ _jsxs("span", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsx("i", {
                                                                        className: "fa-solid fa-comment"
                                                                    }),
                                                                    " ",
                                                                    post.comments
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            }, post.id))
                                    })
                                }),
                                dashboardTab === "profile" && /*#__PURE__*/ _jsxs("div", {
                                    className: "insta-profile-container",
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "insta-profile-header",
                                            children: [
                                                /*#__PURE__*/ _jsx("div", {
                                                    className: "insta-profile-avatar",
                                                    children: /*#__PURE__*/ _jsx("img", {
                                                        src: "/uploads/ic.webp",
                                                        alt: "VietTravel avatar"
                                                    })
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "insta-profile-info",
                                                    children: [
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            className: "insta-profile-row1",
                                                            children: [
                                                                /*#__PURE__*/ _jsx("h2", {
                                                                    className: "insta-profile-username",
                                                                    children: "vietravel.brandgens"
                                                                }),
                                                                /*#__PURE__*/ _jsx("button", {
                                                                    type: "button",
                                                                    className: "insta-profile-btn btn-follow",
                                                                    children: "Theo dõi"
                                                                }),
                                                                /*#__PURE__*/ _jsx("button", {
                                                                    type: "button",
                                                                    className: "insta-profile-btn btn-message",
                                                                    children: "Nhắn tin"
                                                                }),
                                                                /*#__PURE__*/ _jsx("button", {
                                                                    type: "button",
                                                                    className: "insta-profile-settings",
                                                                    children: /*#__PURE__*/ _jsx("i", {
                                                                        className: "fa-solid fa-gear"
                                                                    })
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            className: "insta-profile-row2",
                                                            children: [
                                                                /*#__PURE__*/ _jsxs("span", {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsx("strong", {
                                                                            children: "12"
                                                                        }),
                                                                        " bài viết"
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ _jsxs("span", {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsx("strong", {
                                                                            children: "245k"
                                                                        }),
                                                                        " người theo dõi"
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ _jsxs("span", {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsx("strong", {
                                                                            children: "48"
                                                                        }),
                                                                        " đang theo dõi"
                                                                    ]
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            className: "insta-profile-row3",
                                                            children: [
                                                                /*#__PURE__*/ _jsx("h1", {
                                                                    className: "insta-profile-fullname",
                                                                    children: "VietTravel - Khám Phá Việt Nam"
                                                                }),
                                                                /*#__PURE__*/ _jsxs("p", {
                                                                    className: "insta-profile-bio",
                                                                    children: [
                                                                        "✈️ Chuyên thiết kế mỗi hành trình đong đầy cảm xúc.",
                                                                        /*#__PURE__*/ _jsx("br", {}),
                                                                        "📍 Đồng hành cùng bạn trên mọi nẻo đường đất nước.",
                                                                        /*#__PURE__*/ _jsx("br", {}),
                                                                        "🔗 ",
                                                                        /*#__PURE__*/ _jsx("a", {
                                                                            href: "https://vietravel.brandgens.com",
                                                                            target: "_blank",
                                                                            rel: "noopener noreferrer",
                                                                            children: "vietravel.brandgens.com"
                                                                        })
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "insta-profile-tabs",
                                            children: [
                                                /*#__PURE__*/ _jsxs("span", {
                                                    className: "active",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("i", {
                                                            className: "fa-solid fa-table-cells"
                                                        }),
                                                        " BÀI VIẾT"
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("span", {
                                                    children: [
                                                        /*#__PURE__*/ _jsx("i", {
                                                            className: "fa-solid fa-bookmark"
                                                        }),
                                                        " ĐÃ LƯU"
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsxs("span", {
                                                    children: [
                                                        /*#__PURE__*/ _jsx("i", {
                                                            className: "fa-solid fa-id-card"
                                                        }),
                                                        " ĐƯỢC GẮN THẺ"
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "insta-grid",
                                            children: INSTA_PROFILE_POSTS.map((post)=>/*#__PURE__*/ _jsxs("div", {
                                                    className: "insta-grid-item",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("img", {
                                                            src: post.image,
                                                            alt: "Profile Post ".concat(post.id)
                                                        }),
                                                        /*#__PURE__*/ _jsxs("div", {
                                                            className: "insta-item-overlay",
                                                            children: [
                                                                /*#__PURE__*/ _jsxs("span", {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsx("i", {
                                                                            className: "fa-solid fa-heart"
                                                                        }),
                                                                        " ",
                                                                        post.likes
                                                                    ]
                                                                }),
                                                                /*#__PURE__*/ _jsxs("span", {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsx("i", {
                                                                            className: "fa-solid fa-comment"
                                                                        }),
                                                                        " ",
                                                                        post.comments
                                                                    ]
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }, post.id))
                                        })
                                    ]
                                })
                            ]
                        }),
                        dashboardTab === "home" && /*#__PURE__*/ _jsxs("div", {
                            className: "dashboard-active-details",
                            children: [
                                /*#__PURE__*/ _jsxs("h3", {
                                    className: "active-details-title",
                                    children: [
                                        "Tour Chủ Đề: ",
                                        (_featuredCategories_activeIndex = featuredCategories[activeIndex]) === null || _featuredCategories_activeIndex === void 0 ? void 0 : _featuredCategories_activeIndex.Name
                                    ]
                                }),
                                /*#__PURE__*/ _jsxs("p", {
                                    className: "active-details-desc",
                                    children: [
                                        (_featuredCategories_activeIndex1 = featuredCategories[activeIndex]) === null || _featuredCategories_activeIndex1 === void 0 ? void 0 : _featuredCategories_activeIndex1.visual.summary,
                                        " Cùng VietTravel trải nghiệm những hành trình đong đầy cảm xúc vui sướng và thỏa mãn trên mọi nẻo đường đất nước."
                                    ]
                                })
                            ]
                        }, activeIndex)
                    ]
                })
            }),
            /*#__PURE__*/ _jsx("section", {
                className: "section summer-section",
                id: "companion",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "container",
                    children: [
                        /*#__PURE__*/ _jsx("div", {
                            className: "summer-scenic-banner",
                            ref: summerBannerRef,
                            children: shouldLoadScenicVideo ? /*#__PURE__*/ _jsx("video", {
                                ref: summerVideoRef,
                                src: "https://pub-78113bc2e7004c3696034a6ae8584645.r2.dev/0630(1).mp4",
                                loop: true,
                                muted: true,
                                playsInline: true,
                                preload: "metadata"
                            }) : null
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "summer-row summer-row-bottom",
                            children: [
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "summer-col-text",
                                    children: [
                                        /*#__PURE__*/ _jsx("h2", {
                                            className: "summer-row-title",
                                            children: "Giá Trị Bạn Nhận Được"
                                        }),
                                        /*#__PURE__*/ _jsx("p", {
                                            className: "summer-row-desc",
                                            children: "Hơn 90% khách hàng hài lòng và sẵn sàng giới thiệu VietTravel cho bạn bè. Mỗi hành trình của bạn đều được đồng hành chăm sóc nhiệt tình để mang lại cảm xúc trọn vẹn nhất."
                                        }),
                                        /*#__PURE__*/ _jsx("button", {
                                            type: "button",
                                            className: "summer-row-btn",
                                            onClick: ()=>router.push("/tours"),
                                            children: "Xem đánh giá"
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ _jsx("div", {
                                    className: "summer-col-image",
                                    children: /*#__PURE__*/ _jsxs("div", {
                                        className: "summer-img-card",
                                        children: [
                                            /*#__PURE__*/ _jsx("img", {
                                                src: "/uploads/t1.webp",
                                                alt: "Hệ sinh thái Resort nghỉ dưỡng VietTravel",
                                                loading: "lazy"
                                            }),
                                            /*#__PURE__*/ _jsx("div", {
                                                className: "summer-img-overlay"
                                            }),
                                            /*#__PURE__*/ _jsx("p", {
                                                className: "summer-img-text",
                                                children: '"Đây có lẽ là kỳ nghỉ tuyệt vời nhất cuộc đời tôi..."'
                                            })
                                        ]
                                    })
                                })
                            ]
                        })
                    ]
                })
            }),
            /*#__PURE__*/ _jsx("section", {
                className: "section featured-section",
                id: "featured",
                children: /*#__PURE__*/ _jsxs("div", {
                    className: "container",
                    children: [
                        /*#__PURE__*/ _jsxs("div", {
                            className: "featured-showcase",
                            ref: featuredShowcaseRef,
                            children: [
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "featured-showcase-hero",
                                    children: [
                                        /*#__PURE__*/ _jsx("img", {
                                            src: (featuredHeroTour === null || featuredHeroTour === void 0 ? void 0 : featuredHeroTour.MainImageUrl) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
                                            alt: (featuredHeroTour === null || featuredHeroTour === void 0 ? void 0 : featuredHeroTour.Title) || "Tour du lịch hot",
                                            className: "featured-showcase-bg"
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "featured-showcase-overlay"
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "featured-showcase-copy",
                                            children: [
                                                /*#__PURE__*/ _jsxs("span", {
                                                    className: "section-badge",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("i", {
                                                            className: "fas fa-fire"
                                                        }),
                                                        " Nổi bật"
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsx("h2", {
                                                    children: "Tour Du Lịch Hot Nhất"
                                                }),
                                                /*#__PURE__*/ _jsx("p", {
                                                    children: "Khám phá những hành trình được yêu thích nhất với giá tốt, lịch đẹp và trải nghiệm trọn gói."
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ _jsxs("form", {
                                    className: "featured-search-strip",
                                    onSubmit: submitFeaturedSearch,
                                    children: [
                                        /*#__PURE__*/ _jsxs("label", {
                                            className: "featured-search-item",
                                            children: [
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "featured-search-label",
                                                    children: "Điểm đến"
                                                }),
                                                /*#__PURE__*/ _jsx(CustomSelect, {
                                                    className: "featured-search-control",
                                                    value: featuredSearch.destination,
                                                    onChange: handleFeaturedSearchChange("destination"),
                                                    options: [
                                                        {
                                                            value: "",
                                                            label: "Chọn điểm đến"
                                                        },
                                                        ...destinationOptions
                                                    ],
                                                    placeholder: "Chọn điểm đến"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("label", {
                                            className: "featured-search-item",
                                            children: [
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "featured-search-label",
                                                    children: "Thời gian"
                                                }),
                                                /*#__PURE__*/ _jsx(CustomSelect, {
                                                    className: "featured-search-control",
                                                    value: featuredSearch.duration,
                                                    onChange: handleFeaturedSearchChange("duration"),
                                                    options: durationOptions,
                                                    placeholder: "Chọn số ngày"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("label", {
                                            className: "featured-search-item",
                                            children: [
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "featured-search-label",
                                                    children: "Ngân sách"
                                                }),
                                                /*#__PURE__*/ _jsx(CustomSelect, {
                                                    className: "featured-search-control",
                                                    value: featuredSearch.maxPrice,
                                                    onChange: handleFeaturedSearchChange("maxPrice"),
                                                    options: priceOptions,
                                                    placeholder: "Chọn mức giá"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("label", {
                                            className: "featured-search-item",
                                            children: [
                                                /*#__PURE__*/ _jsx("span", {
                                                    className: "featured-search-label",
                                                    children: "Ưu tiên"
                                                }),
                                                /*#__PURE__*/ _jsx(CustomSelect, {
                                                    className: "featured-search-control",
                                                    value: featuredSearch.sort,
                                                    onChange: handleFeaturedSearchChange("sort"),
                                                    options: sortOptions,
                                                    placeholder: "Chọn ưu tiên"
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx("button", {
                                            type: "submit",
                                            className: "featured-search-action",
                                            "aria-label": "Tìm kiếm tour",
                                            children: /*#__PURE__*/ _jsx("i", {
                                                className: "fas fa-search"
                                            })
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                            className: "featured-popular-head",
                            children: [
                                /*#__PURE__*/ _jsx("h3", {
                                    children: "Tour Nổi Bật"
                                }),
                                /*#__PURE__*/ _jsxs("a", {
                                    href: "/tours",
                                    className: "featured-popular-link",
                                    children: [
                                        "Xem tất cả ",
                                        /*#__PURE__*/ _jsx("i", {
                                            className: "fas fa-arrow-right"
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsx("div", {
                            className: "tours-grid",
                            children: loading ? /*#__PURE__*/ _jsx("div", {
                                className: "loader",
                                style: {
                                    gridColumn: "1/-1",
                                    margin: "40px auto"
                                }
                            }) : featured.map((tour)=>/*#__PURE__*/ _jsx(TourCard, {
                                    tour: tour
                                }, tour.TourId))
                        })
                    ]
                })
            }),
            <section className="section destinations-section" id="destinations" ref={destinationsSectionRef}>
              <div className="container">
                <div className="destinations-showcase">
                  <div className="destinations-ambient" />
                  <div className="destinations-copy">
                    <span className="destinations-kicker">Việt Nam qua những thước phim</span>
                    <h2>
                      <span>Đi để thấy</span>
                      một Việt Nam
                      <em>rất khác</em>
                    </h2>
                    <p className="destinations-lead">
                      Có những miền đất không chỉ để ghé qua, mà để thương, để nhớ
                      và muốn một ngày quay lại.
                    </p>
                    <button
                      type="button"
                      className="destinations-watch"
                      onClick={() => router.push(`/tours?destination=${VIDEO_DESTINATIONS[videoIndex].slug}`)}
                    >
                      <span className="destinations-watch-icon">
                        <i className="fas fa-play" />
                      </span>
                      Mở hành trình cảm xúc
                    </button>
                    <p className="destinations-note">
                      Từ núi rừng thức giấc trong sương đến phố cổ lên đèn lúc hoàng hôn,
                      mỗi khung hình là một lời mời bạn bước ra và sống trọn chuyến đi của mình.
                    </p>
                  </div>

                  <div className="destinations-reels-wrapper">
                    <div className="destinations-reels-container">
                      <div className="destinations-reels-viewport">
                        <div 
                          className="destinations-reels-track" 
                          style={{ '--video-index': videoIndex }}
                        >
                          {VIDEO_DESTINATIONS.map((dest, index) => {
                            const isActive = index === videoIndex;
                            const isPlaying = isPlayingMap[index];
                            return (
                              <div 
                                key={dest.id}
                                className={`video-reel-card ${isActive ? 'active' : ''}`}
                                onClick={() => handleVideoCardClick(index)}
                                style={{ cursor: 'pointer' }}
                              >
                                <video
                                  ref={(el) => { videoRefs.current[index] = el; }}
                                  className="video-reel-video"
                                  src={loadedVideoMap[index] ? dest.videoUrl : undefined}
                                  loop
                                  playsInline
                                  defaultMuted
                                  preload={isActive && isIntersecting ? "auto" : "metadata"}
                                />

                                {/* Position Badge inside each card */}
                                <div className="destinations-active-location">
                                  <i className="fa-solid fa-location-dot" />
                                  <span>{dest.name}</span>
                                </div>

                                {/* Favorite Heart Button in top-right */}
                                <button 
                                  className="video-reel-favorite" 
                                  type="button" 
                                  aria-label="Add to favorites"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <i className="fa-regular fa-heart" />
                                </button>

                                {/* Glass bottom details panel */}
                                <div className="video-reel-details-panel">
                                  <div className="video-reel-details-content">
                                    <h3 className="video-reel-title">{dest.name}</h3>
                                    <p className="video-reel-subtitle">Khám phá Việt Nam</p>
                                    
                                    <div className="video-reel-info-row">
                                      <span className="video-reel-tag">
                                        <i className="fa-solid fa-tags" /> từ 1.200.000đ
                                      </span>
                                      <span className="video-reel-flight">
                                        <i className="fa-solid fa-plane" /> Tour Trọn Gói
                                      </span>
                                    </div>
                                    
                                    <button 
                                      type="button" 
                                      className="video-reel-cta"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/tours?destination=${dest.slug}`);
                                      }}
                                    >
                                      Xem chi tiết
                                    </button>
                                  </div>
                                </div>

                                {!isActive && <div className="video-reel-inactive-overlay" />}
                                <div className="video-reel-play-indicator">
                                  <i className={isActive && isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play"} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={handlePrevVideo} 
                        className="nav-btn prev-btn" 
                        aria-label="Previous video"
                      >
                        <i className="fa-solid fa-chevron-left" />
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={handleNextVideo} 
                        className="nav-btn next-btn" 
                        aria-label="Next video"
                      >
                        <i className="fa-solid fa-chevron-right" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>,
            /*#__PURE__*/ _jsx("section", {
                className: "section contact-section",
                id: "contact",
                children: /*#__PURE__*/ _jsx("div", {
                    className: "container",
                    children: /*#__PURE__*/ _jsx("div", {
                        className: "newsletter-inner-vertical",
                        children: /*#__PURE__*/ _jsxs("div", {
                            className: "newsletter-form-container-vertical",
                            children: [
                                /*#__PURE__*/ _jsx("div", {
                                    className: "newsletter-badge",
                                    children: "🔥 ƯU ĐÃI ĐỘC QUYỀN"
                                }),
                                /*#__PURE__*/ _jsxs("div", {
                                    className: "newsletter-info-vertical",
                                    children: [
                                        /*#__PURE__*/ _jsx("h2", {
                                            children: "Nhận Ưu Đãi Đặc Biệt"
                                        }),
                                        /*#__PURE__*/ _jsx("p", {
                                            children: "Đăng ký nhận thông báo về các tour khuyến mãi độc quyền và mã giảm giá du lịch mới nhất từ VietTravel."
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ _jsxs("form", {
                                    className: "newsletter-form-premium-vertical",
                                    onSubmit: handlePromoSubmit,
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "form-group-premium-iconic",
                                            children: [
                                                /*#__PURE__*/ _jsx("label", {
                                                    htmlFor: "promo-name",
                                                    children: "Họ và tên"
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "input-with-icon",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("i", {
                                                            className: "fa-regular fa-user"
                                                        }),
                                                        /*#__PURE__*/ _jsx("input", {
                                                            type: "text",
                                                            id: "promo-name",
                                                            placeholder: "Nguyễn Văn A",
                                                            value: promoForm.fullName,
                                                            onChange: (e)=>setPromoForm((f)=>({
                                                                        ...f,
                                                                        fullName: e.target.value
                                                                    })),
                                                            required: true
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "form-group-premium-iconic",
                                            children: [
                                                /*#__PURE__*/ _jsx("label", {
                                                    htmlFor: "promo-email",
                                                    children: "Địa chỉ Email"
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "input-with-icon",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("i", {
                                                            className: "fa-regular fa-envelope"
                                                        }),
                                                        /*#__PURE__*/ _jsx("input", {
                                                            type: "email",
                                                            id: "promo-email",
                                                            placeholder: "email@example.com",
                                                            value: promoForm.email,
                                                            onChange: (e)=>setPromoForm((f)=>({
                                                                        ...f,
                                                                        email: e.target.value
                                                                    })),
                                                            required: true
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "form-group-premium-iconic",
                                            children: [
                                                /*#__PURE__*/ _jsx("label", {
                                                    htmlFor: "promo-phone",
                                                    children: "Số điện thoại"
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "input-with-icon",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("i", {
                                                            className: "fa-solid fa-phone"
                                                        }),
                                                        /*#__PURE__*/ _jsx("input", {
                                                            type: "tel",
                                                            id: "promo-phone",
                                                            placeholder: "0912345678",
                                                            value: promoForm.phone,
                                                            onChange: (e)=>setPromoForm((f)=>({
                                                                        ...f,
                                                                        phone: e.target.value
                                                                    }))
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "form-group-premium-iconic",
                                            children: [
                                                /*#__PURE__*/ _jsx("label", {
                                                    htmlFor: "promo-code",
                                                    children: "Mã khuyến mãi (nếu có)"
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                    className: "input-with-icon",
                                                    children: [
                                                        /*#__PURE__*/ _jsx("i", {
                                                            className: "fa-solid fa-ticket"
                                                        }),
                                                        /*#__PURE__*/ _jsx("input", {
                                                            type: "text",
                                                            id: "promo-code",
                                                            placeholder: "VIETTRAVEL35",
                                                            value: promoForm.promoCode,
                                                            onChange: (e)=>setPromoForm((f)=>({
                                                                        ...f,
                                                                        promoCode: e.target.value
                                                                    }))
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        promoMessage && /*#__PURE__*/ _jsxs("div", {
                                            className: "promo-alert ".concat(promoSuccess ? "success" : "error"),
                                            children: [
                                                /*#__PURE__*/ _jsx("i", {
                                                    className: promoSuccess ? "fa-solid fa-circle-check" : "fa-solid fa-circle-xmark"
                                                }),
                                                /*#__PURE__*/ _jsx("span", {
                                                    children: promoMessage
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx("button", {
                                            type: "submit",
                                            className: "form-submit-premium-btn",
                                            disabled: promoLoading,
                                            children: promoLoading ? /*#__PURE__*/ _jsxs(_Fragment, {
                                                children: [
                                                    /*#__PURE__*/ _jsx("i", {
                                                        className: "fa-solid fa-spinner fa-spin",
                                                        style: {
                                                            marginRight: 8
                                                        }
                                                    }),
                                                    "Đang gửi..."
                                                ]
                                            }) : /*#__PURE__*/ _jsxs(_Fragment, {
                                                children: [
                                                    "Đăng Ký Ngay",
                                                    /*#__PURE__*/ _jsx("i", {
                                                        className: "fa-solid fa-paper-plane",
                                                        style: {
                                                            marginLeft: 8
                                                        }
                                                    })
                                                ]
                                            })
                                        })
                                    ]
                                })
                            ]
                        })
                    })
                })
            })
        ]
    });
}
