/** Noi dung gioi thieu dia danh cho hero - keyed theo slug tour. */
const HERO_DEST_INTROS = {
  'kham-pha-quang-binh-phong-nha-ke-bang-3n2d': {
    name: 'Quảng Bình',
    text: 'Vương quốc hang động kỳ vĩ giữa núi Trường Sơn hùng vĩ. Phong Nha - Kẻ Bàng mở ra thế giới ngầm lung linh, nơi sông chảy qua lòng đá và ánh sáng len lỏi từng vách động.',
  },
  'ha-noi-ha-long-4n3d': {
    name: 'Hạ Long',
    text: 'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi nhô lên mặt biển xanh. Du thuyền giữa vịnh Hạ Long là hành trình lãng mạn giữa sương mù và hoàng hôn phương Bắc.',
  },
  'ha-noi-hue-3n2d': {
    name: 'Huế',
    text: 'Cố đô ngàn năm bên dòng Hương thơ mộng. Kinh thành Huế, lăng tẩm triều Nguyễn và những chiếc thuyền rồng trôi chậm giữa sông là nơi lịch sử và thi ca hòa quyện.',
  },
  'da-nang-hoi-an-3n2d': {
    name: 'Đà Nẵng',
    text: 'Cầu Vàng nổi bật giữa mây trời Bà Nà Hills, như dải lụa vàng được nâng đỡ bởi đôi bàn tay khổng lồ. Đà Nẵng gây ấn tượng bởi vẻ hiện đại, biển xanh và những công trình biểu tượng đầy cảm hứng.',
  },
  'ha-noi-ninh-binh-trang-an': {
    name: 'Ninh Bình',
    text: 'Vùng đất "Hạ Long trên cạn" với dòng sông uốn quanh núi đá vôi. Tràng An, Tam Cốc - Bích Động mang đến trải nghiệm chèo thuyền giữa hang động và ruộng lúa xanh mướt.',
  },
};

export function getHeroDestIntro(tour) {
  if (!tour) {
    return {
      name: 'Việt Nam',
      text: 'Khám phá vẻ đẹp đa dạng của đất nước hình chữ S, từ núi non hùng vĩ đến biển cả bao la.',
    };
  }

  const custom = HERO_DEST_INTROS[tour.Slug];
  if (custom) return custom;

  const name = tour.DestinationNames?.split(',')[0]?.trim()
    || tour.Title?.split('-')[0]?.trim()
    || 'Việt Nam';

  return {
    name,
    text: tour.ShortDescription || tour.Description || 'Hành trình đáng nhớ cùng VietTravel.',
  };
}
