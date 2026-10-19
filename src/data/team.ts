export interface TeamMember {
  fullName: string;
  nickname: string;
  studentId: string;
  photo: string;
}

export const TEAM: TeamMember[] = [
  {
    fullName: "จตุพร สุบิน",
    nickname: "บีม",
    studentId: "1660600188",
    photo: "/team/beam.png",
  },
  {
    fullName: "ณัฐพงศ์ กัลยารัตน์",
    nickname: "บอล",
    studentId: "1660700327",
    photo: "/team/ball.png",
  },
  {
    fullName: "พิชญุตม์ มารมย์",
    nickname: "ฟิว",
    studentId: "1660701085",
    photo: "/team/few.png",
  },
];

export interface ApiSource {
  name: string;
  description: string;
  url: string;
}

export const API_SOURCES: ApiSource[] = [
  {
    name: "Hugging Face Dataset: Ehsanrs2/Forex_Factory_Calendar",
    description:
      "ชุดข้อมูลปฏิทินข่าวเศรษฐกิจ (2007 – เม.ย. 2025) ที่ใช้เป็นแหล่งข้อมูลหลัก",
    url: "https://huggingface.co/datasets/Ehsanrs2/Forex_Factory_Calendar",
  },
  {
    name: "Forex Factory Calendar",
    description:
      "แหล่งที่มาดั้งเดิมของเนื้อหาปฏิทินข่าว (ข้อมูลเป็นลิขสิทธิ์ของเจ้าของเดิม)",
    url: "https://www.forexfactory.com/calendar",
  },
  {
    name: "NewsForex API (/api/calendar)",
    description:
      "REST API ที่กลุ่มพัฒนาเอง (Vercel Serverless Function) — เอกสารการใช้งานอยู่ใน README.md ของโปรเจกต์",
    url: "https://github.com/Pakaoww/NewsForex_mini2",
  },
];
