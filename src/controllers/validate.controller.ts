import { register } from "ts-node";

export function validateHeaderExcel(index: number, value: string) {
  const patterns = [
    new RegExp(/ลำดับที่/),
    new RegExp(/ชื่อย่อหลักทรัพย์/),
    new RegExp(/เลขทะเบียนผู้ถือหุ้น/),
    new RegExp(/ประเภทบุคคล/),
    new RegExp(/จำนวนหุ้นที่ถือรวม/),
    new RegExp(/รหัสคำนำหน้าชื่อ/),
    new RegExp(/คำนำหน้าชื่อ/),
    new RegExp(/ชื่อ/),
    new RegExp(/นามสกุล/),
    new RegExp(/ที่อยู่/),
    new RegExp(/รหัสไปรษณีย์/),
    new RegExp(/หมายเลขโทรศัพท์บ้าน/),
    new RegExp(/หมายเลขโทรศัพท์ที่ทำงาน/),
    new RegExp(/หมายเลขโทรศัพท์มือถือ/),
    new RegExp(/หมายเลขโทรสาร/),
    new RegExp(/Email/),
    new RegExp(/เงื่อนไขการหักภาษีณ.ที่จ่าย/),
    new RegExp(/เลขประจำตัวผู้เสียภาษี/),
    new RegExp(/อัตราภาษีหักณ.ที่จ่าย/),
    new RegExp(/สัญชาติผู้ถือหุ้น/),
    new RegExp(/รหัสอาชีพผู้ถือหุ้น/),
    new RegExp(/ธนาคาร/),
    new RegExp(/เลขบัญชีธนาคาร/),
    new RegExp(/เลขที่สมาชิกศูนย์รับฝาก/),
    new RegExp(/ประเภทเลขอ้างอิง/),
    new RegExp(/เลขที่ Ref/),
    new RegExp(/หลักทรัพย์ที่ได้สิทธิ/),
    new RegExp(/จำนวนหุ้นที่ใช้ในการคำนวณ/),
    new RegExp(/Ratio/),
    new RegExp(/หุ้นตามสิทธิ/),
    new RegExp(/จำนวนหุ้นที่จองซื้อ/),
    new RegExp(/เลขที่สมาชิก/),
    new RegExp(/บัญชีสมาชิก/),
    new RegExp(/RightSpecialName/),
    new RegExp(/RightSpecialVolume/),
    new RegExp(/Company/),
    new RegExp(/DetailShort/),
    new RegExp(/DetailFull/),
  ];

  const pattern = patterns[index];

  const result = pattern.test(value);

  if (!result) {
    console.log(`column ${index + 1} value ${value}`);
    throw "error";
  }

  return value;
}
