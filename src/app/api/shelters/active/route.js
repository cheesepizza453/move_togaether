import { createAdminSupabaseClient } from '@/lib/supabase';

const supabase = createAdminSupabaseClient();

export async function GET() {
  try {
    // 현재 날짜
    const currentDate = new Date().toISOString().split('T')[0];

    // 출발지 좌표가 있고, status가 active이며, deadline이 지나지 않은 게시물 조회
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        description,
        departure_address,
        departure_lat,
        departure_lng,
        arrival_address,
        arrival_lat,
        arrival_lng,
        dog_name,
        dog_size,
        dog_breed,
        dog_age,
        dog_characteristics,
        images,
        deadline,
        created_at
      `)
      .not('departure_lat', 'is', null)
      .not('departure_lng', 'is', null)
      .eq('status', 'active')
      .eq('is_deleted', false)
      .gte('deadline', currentDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return Response.json({ error: '데이터를 불러오는데 실패했습니다.' }, { status: 500 });
    }

    // 데이터 가공
    const processedData = data.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      departure: {
        address: post.departure_address,
        lat: parseFloat(post.departure_lat),
        lng: parseFloat(post.departure_lng)
      },
      arrival: {
        address: post.arrival_address,
        lat: post.arrival_lat ? parseFloat(post.arrival_lat) : null,
        lng: post.arrival_lng ? parseFloat(post.arrival_lng) : null
      },
      dog: {
        name: post.dog_name,
        size: post.dog_size,
        breed: post.dog_breed,
        age: post.dog_age,
        characteristics: post.dog_characteristics
      },
      images: post.images || [],
      deadline: post.deadline,
      createdAt: post.created_at
    }));

    return Response.json({
      success: true,
      data: processedData,
      count: processedData.length
    });

  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
