import html
import sys

MAIN_X, W, GAP = 380, 200, 44
SIDE_X = {"L": 80, "R": 680}
HEIGHT = {"oval": 40, "rect": 56, "diamond": 88}
INK, MUTED, ACCENT, LINK, PAPER = "#2d3142", "#4f5d75", "#bf4520", "#2e5aa8", "#f5f5f5"
SANS = "'Geist','Noto Sans Thai',system-ui,sans-serif"
MONO = "'Geist Mono','Noto Sans Thai',ui-monospace,monospace"
COMBINING = set(range(0x0E31, 0x0E32)) | set(range(0x0E34, 0x0E3B)) | set(range(0x0E47, 0x0E4F))


def vis(text):
    return sum(1 for ch in text if ord(ch) not in COMBINING)


def mask_w(text):
    return int(-(-(vis(text) * 5.6 + 12) // 4) * 4)


def e(text):
    return html.escape(text, quote=True)


def build(flow):
    slug = flow["slug"]
    mk = {"muted": f"arrow-{slug}", "accent": f"arrow-accent-{slug}", "link": f"arrow-link-{slug}"}
    nodes = {}
    y = 40
    for n in flow["main"]:
        h = HEIGHT[n["t"]]
        nodes[n["id"]] = dict(n, x=MAIN_X, y=y, w=W, h=h, cx=MAIN_X + W // 2, cy=y + h // 2, main=True)
        y += h + GAP
    for s in flow["side"]:
        anchor = nodes[s["row"]]
        h = HEIGHT[s["t"]]
        x = SIDE_X[s["side"]]
        nodes[s["id"]] = dict(s, x=x, y=anchor["cy"] - h // 2, w=W, h=h, cx=x + W // 2, cy=anchor["cy"], main=False)
    bottom = max(n["y"] + n["h"] for n in nodes.values())

    paths, labels = [], []
    used = {"net": False, "dash": False}

    def stroke_of(opt):
        if opt.get("net"):
            used["net"] = True
            return LINK, mk["link"]
        if opt.get("accent"):
            return ACCENT, mk["accent"]
        return MUTED, mk["muted"]

    def add_label(text, mx, my, anchor_mid_x=None):
        w = mask_w(text)
        x0 = int(mx - w / 2)
        labels.append(f'<rect x="{x0}" y="{int(my - 8)}" width="{w}" height="16" rx="2" fill="{PAPER}"/>'
                      f'<text x="{mx}" y="{int(my + 4)}" text-anchor="middle">{e(text)}</text>')

    for ed in flow["edges"]:
        a, b = nodes[ed["from"]], nodes[ed["to"]]
        color, marker = stroke_of(ed)
        label = ed.get("label", "")
        if a["main"] and b["main"]:
            x, y1, y2 = a["cx"], a["y"] + a["h"], b["y"]
            paths.append(f'<line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}" stroke="{color}" marker-end="url(#{marker})"/>')
            if label:
                w = mask_w(label)
                add_label(label, x + 8 + w // 2, (y1 + y2) // 2)
        elif a["main"] and not b["main"]:
            side = b.get("side")
            if side == "R":
                x1, x2 = a["x"] + a["w"], b["x"]
            else:
                x1, x2 = a["x"], b["x"] + b["w"]
            y1 = a["cy"]
            paths.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y1}" stroke="{color}" marker-end="url(#{marker})"/>')
            if label:
                w = mask_w(label)
                add_label(label, (x1 + x2) // 2, y1 - 16)
        elif (not a["main"]) and b["main"] and a["cy"] == b["cy"]:
            side = a.get("side")
            if side == "R":
                x1, x2 = a["x"], b["x"] + b["w"]
            else:
                x1, x2 = a["x"] + a["w"], b["x"]
            y1 = a["cy"]
            paths.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y1}" stroke="{color}" marker-end="url(#{marker})"/>')
            if label:
                add_label(label, (x1 + x2) // 2, y1 - 16)
        else:
            side = a.get("side")
            cx = a["cx"]
            yt = b["cy"]
            down = yt > a["cy"]
            ys = a["y"] + a["h"] if down else a["y"]
            if side == "R":
                xt, dx = b["x"] + b["w"], -8
            else:
                xt, dx = b["x"], 8
            vy = yt - 8 if down else yt + 8
            d = f"M{cx},{ys} V{vy} Q{cx},{yt} {cx + dx},{yt} H{xt}"
            used["dash"] = True
            paths.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-dasharray="5,4" marker-end="url(#{marker})"/>')
            if label:
                add_label(label, (cx + xt) // 2, yt - 16)

    shapes = []
    for n in nodes.values():
        x, y, w, h, cx, cy = n["x"], n["y"], n["w"], n["h"], n["cx"], n["cy"]
        fill, stroke = ("rgba(191,69,32,0.08)", ACCENT) if n.get("focal") else ("#ffffff", INK)
        if n["t"] == "diamond":
            pts = f"{cx},{y} {x + w},{cy} {cx},{y + h} {x},{cy}"
            shapes.append(f'<polygon points="{pts}" fill="{PAPER}"/><polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="1"/>')
            name_y, sub_y = cy - 2, cy + 14
        else:
            rx = 20 if n["t"] == "oval" else 6
            shapes.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{PAPER}"/>'
                          f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="1"/>')
            name_y, sub_y = (cy + 4, None) if not n.get("s") else (cy - 4, cy + 14)
        shapes.append(f'<text x="{cx}" y="{name_y}" fill="{INK}" font-size="12" font-weight="600" font-family="{SANS}" text-anchor="middle">{e(n["n"])}</text>')
        if n.get("s"):
            shapes.append(f'<text x="{cx}" y="{sub_y}" fill="{MUTED}" font-size="9" font-family="{MONO}" text-anchor="middle">{e(n["s"])}</text>')

    legend_y = bottom + 36
    items = [("oval", "เริ่ม / จบ"), ("rect", "ขั้นตอน"), ("diamond", "การตัดสินใจ"), ("focal", "จุดสำคัญ")]
    if used["net"]:
        items.append(("net", "เรียก Supabase"))
    if used["dash"]:
        items.append(("dash", "ย้อนกลับ"))
    leg = [f'<line x1="30" y1="{legend_y}" x2="930" y2="{legend_y}" stroke="rgba(45,49,66,0.10)" stroke-width="0.8"/>',
           f'<text x="30" y="{legend_y + 24}" letter-spacing="0.14em">LEGEND</text>']
    lx, ly = 110, legend_y + 14
    for kind, text in items:
        if kind == "oval":
            leg.append(f'<rect x="{lx}" y="{ly}" width="28" height="14" rx="7" fill="#fff" stroke="{INK}"/>')
        elif kind == "rect":
            leg.append(f'<rect x="{lx}" y="{ly}" width="28" height="14" rx="3" fill="#fff" stroke="{INK}"/>')
        elif kind == "diamond":
            leg.append(f'<polygon points="{lx},{ly + 7} {lx + 14},{ly} {lx + 28},{ly + 7} {lx + 14},{ly + 14}" fill="#fff" stroke="{INK}"/>')
        elif kind == "focal":
            leg.append(f'<rect x="{lx}" y="{ly}" width="28" height="14" rx="3" fill="rgba(191,69,32,0.08)" stroke="{ACCENT}"/>')
        elif kind == "net":
            leg.append(f'<line x1="{lx}" y1="{ly + 7}" x2="{lx + 28}" y2="{ly + 7}" stroke="{LINK}" stroke-width="1.2"/>')
        else:
            leg.append(f'<line x1="{lx}" y1="{ly + 7}" x2="{lx + 28}" y2="{ly + 7}" stroke="{MUTED}" stroke-width="1.2" stroke-dasharray="5,4"/>')
        leg.append(f'<text x="{lx + 36}" y="{ly + 11}">{e(text)}</text>')
        lx += 36 + int(vis(text) * 5.4) + 36
    vb_h = legend_y + 48

    defs = "".join(f'<marker id="{mk[k]}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="{c}"/></marker>'
                   for k, c in (("muted", MUTED), ("accent", ACCENT), ("link", LINK)))
    svg = (f'<svg viewBox="0 0 960 {vb_h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="{slug}-title {slug}-desc">'
           f'<title id="{slug}-title">{e(flow["title"])}</title><desc id="{slug}-desc">{e(flow["desc"])}</desc>'
           f'<defs>{defs}</defs><rect width="100%" height="100%" fill="{PAPER}"/>'
           f'<g stroke-width="1.2" fill="none">{"".join(paths)}</g>'
           f'<g font-family="{MONO}" font-size="9" fill="{MUTED}">{"".join(labels)}</g>'
           f'{"".join(shapes)}'
           f'<g font-family="{MONO}" font-size="8" fill="{MUTED}">{"".join(leg)}</g></svg>')
    return svg


def M(id, t, n, s=None, focal=False):
    return dict(id=id, t=t, n=n, s=s, focal=focal)


def S(id, side, row, t, n, s=None):
    return dict(id=id, side=side, row=row, t=t, n=n, s=s)


def E(a, b, label="", **kw):
    return dict({"from": a, "to": b, "label": label}, **kw)


FLOWS = [
    dict(slug="flow-todo", path="/todo", title="วันนี้ทำอะไรดี", desc="เพิ่ม แก้ไข และเปลี่ยนสถานะงาน พร้อมการตรวจข้อมูลและ trigger ตั้งเวลาที่เสร็จ",
         main=[M("a", "oval", "เปิดหน้ารายการงาน"),
               M("b", "rect", "โหลดรายการ", "กรองสถานะ · แบ่งหน้า 10"),
               M("c", "diamond", "มีงานไหม?"),
               M("d", "rect", "เพิ่ม / แก้ไขงาน", "ชื่อ ≤100 · ห้ามซ้ำ"),
               M("e", "diamond", "ฟอร์มถูกต้อง?", "validate ฝั่ง UI + DB"),
               M("f", "rect", "บันทึกลง Supabase", "trigger ตั้ง completed_at", focal=True),
               M("g", "oval", "รีเฟรชรายการ + Toast")],
         side=[S("h", "R", "c", "rect", "Empty State", "ชวนเพิ่มงานแรก"),
               S("i", "L", "e", "rect", "แสดง error ใต้ช่อง", "ชื่อว่าง / ซ้ำ / ยาวเกิน")],
         edges=[E("a", "b", "SELECT", net=True), E("b", "c"), E("c", "d", "เพิ่ม/แก้ไข"), E("c", "h", "ไม่มี"),
                E("h", "d", "เพิ่มงานแรก"), E("d", "e"), E("e", "f", "ผ่าน", net=True), E("e", "i", "ไม่ผ่าน"),
                E("i", "d", "แก้ไข"), E("f", "g")]),
    dict(slug="flow-randomizer", path="/randomizer", title="สับสนช่วยหน่อย", desc="สุ่มรายการจากกลุ่มที่เลือกโดยไม่สุ่มซ้ำ ทำงานฝั่ง client ทั้งหมด ไม่เก็บ session ลงฐานข้อมูล",
         main=[M("a", "oval", "เลือกกลุ่ม", "เลือกหลายกลุ่มได้"),
               M("b", "rect", "สร้าง Pool ปัจจุบัน", "buildPool − excludedIds"),
               M("c", "diamond", "Pool ว่างไหม?"),
               M("d", "rect", "สุ่ม 1 รายการ", "pickRandomItem · ~1 วินาที", focal=True),
               M("e", "oval", "แสดงผล + ย้ายไป Excluded")],
         side=[S("f", "R", "c", "rect", "แจ้งว่าไม่เหลือรายการ", "ให้กดเริ่มสุ่มใหม่"),
               S("g", "L", "b", "rect", "แก้ / ลบรายการ หรือกลุ่ม", "ตัดออกจากทั้งสอง Pool")],
         edges=[E("a", "b"), E("b", "c"), E("c", "d", "ไม่ว่าง"), E("c", "f", "ว่าง"), E("f", "b", "เริ่มสุ่มใหม่"),
                E("g", "b", "อัปเดต"), E("d", "e")]),
    dict(slug="flow-finance", path="/finance", title="เงินฉันไปไหน", desc="โหลดหมวดหมู่ บันทึกรายรับรายจ่ายโดยฐานข้อมูลบังคับประเภทให้ตรงหมวด แล้วสรุปฝั่ง client",
         main=[M("a", "oval", "เปิดหน้ารายรับ-รายจ่าย"),
               M("b", "rect", "โหลดหมวดหมู่", "listWithSeed"),
               M("c", "diamond", "มีหมวดหมู่ไหม?"),
               M("d", "rect", "กรอกรายการ", "จำนวนเงิน · ประเภท · หมวด"),
               M("e", "diamond", "ประเภทตรงหมวด?", "FK (category_id, type)", focal=True),
               M("f", "rect", "บันทึกลง Supabase", "insert + RLS"),
               M("g", "oval", "แสดงรายการ + สรุป")],
         side=[S("h", "R", "c", "rect", "สร้างหมวดเริ่มต้น", "rpc seed_default_categories"),
               S("i", "L", "e", "rect", "แจ้ง error ภาษาไทย", "23503 / CHECK")],
         edges=[E("a", "b", "SELECT", net=True), E("b", "c"), E("c", "d", "มี"), E("c", "h", "ไม่มี", net=True),
                E("h", "d", "โหลดใหม่"), E("d", "e"), E("e", "f", "ตรง", net=True), E("e", "i", "ไม่ตรง"),
                E("i", "d", "แก้ไข"), E("f", "g")]),
    dict(slug="flow-calorie", path="/calorie", title="ผอมไปด้วยกัน", desc="คำนวณ BMR และ TDEE บันทึกโปรไฟล์ แล้วบันทึกอาหารที่กินเทียบกับ TDEE",
         main=[M("a", "oval", "กรอกข้อมูลร่างกาย", "เพศ อายุ น้ำหนัก ส่วนสูง"),
               M("b", "diamond", "ข้อมูลอยู่ในช่วง?", "validateBmrInput"),
               M("c", "rect", "คำนวณ BMR → TDEE", "Mifflin-St Jeor × ตัวคูณ", focal=True),
               M("d", "rect", "บันทึกโปรไฟล์", "upsert onConflict user_id"),
               M("e", "rect", "เลือกอาหาร + มื้อ", "จำนวน × kcal ต่อหน่วย"),
               M("f", "rect", "บันทึกรายการอาหาร", "เก็บสำเนาชื่อ/หน่วย/kcal"),
               M("g", "oval", "รวมรายมื้อ/วัน เทียบ TDEE")],
         side=[S("h", "L", "b", "rect", "แสดง error ใต้ช่อง", "เช่น อายุหรือน้ำหนักผิดช่วง"),
               S("i", "R", "e", "rect", "เติมอาหารตั้งต้น", "seed_default_foods 102 เมนู")],
         edges=[E("a", "b"), E("b", "c", "ผ่าน"), E("b", "h", "ไม่ผ่าน"), E("h", "a", "แก้ไข"), E("c", "d"),
                E("d", "e", "UPSERT", net=True), E("i", "e", "ถ้ายังไม่มี", net=True), E("e", "f"),
                E("f", "g", "INSERT", net=True)]),
    dict(slug="flow-unit-price", path="/unit-price", title="อันไหนถูกกว่า บอกมา", desc="เปรียบเทียบราคาต่อหน่วยของ 2–3 ตัวเลือก คำนวณฝั่ง client ล้วนและไม่มีฐานข้อมูล",
         main=[M("a", "oval", "กรอก 2–3 ตัวเลือก", "ราคา · ปริมาณ · หน่วย"),
               M("b", "diamond", "ใช้เทียบได้ไหม?", "≥2 ตัวเลือก · กลุ่มเดียวกัน"),
               M("c", "rect", "คำนวณราคาต่อหน่วย", "ราคา ÷ ปริมาณฐาน × หน่วยผล", focal=True),
               M("d", "diamond", "ราคาเท่ากันไหม?", "tolerance สัมพัทธ์ 1e-9"),
               M("e", "oval", "แสดงผล + ป้ายคุ้มที่สุด")],
         side=[S("f", "R", "b", "rect", "แจ้งให้กรอกเพิ่ม", "ข้ามตัวเลือกที่ไม่ถูกต้อง"),
               S("g", "R", "d", "rect", "ไม่ระบุตัวที่คุ้มสุด", "แสดงทุกตัวเท่ากัน"),
               S("h", "L", "e", "rect", "แก้ข้อมูล → ล้างผล", "ต้องกดเปรียบเทียบใหม่")],
         edges=[E("a", "b", "กดเปรียบเทียบ"), E("b", "c", "ได้"), E("b", "f", "ไม่ได้"), E("f", "a", "แก้ไข"),
                E("c", "d"), E("d", "e", "ต่างกัน"), E("d", "g", "เท่ากัน"), E("g", "e", "แสดงผล"),
                E("e", "h", "แก้ไข"), E("h", "a", "เริ่มใหม่")]),
    dict(slug="flow-expiry", path="/expiry-tracker", title="อย่าลืมฉัน", desc="โหลดรายการและคำนวณสถานะสี เตือนในแอป และกดทำแล้วผ่าน RPC ธุรกรรมเดียว",
         main=[M("a", "oval", "เปิดหน้ารายการ"),
               M("b", "rect", "โหลดรายการ + คำนวณสถานะ", "daysLeft → แดง/เหลือง/เขียว"),
               M("c", "diamond", "ถึงเกณฑ์เตือน?", "isReminding"),
               M("d", "rect", "กด \"ทำแล้ว\"", "เติมวันครบกำหนดถัดไปให้"),
               M("e", "diamond", "กรอกวันถัดไป?", "ว่าง = ไม่ทำซ้ำ"),
               M("f", "rect", "RPC complete_reminder", "ธุรกรรมเดียว", focal=True),
               M("g", "oval", "บันทึกประวัติ + Toast")],
         side=[S("h", "R", "c", "rect", "แสดงแบนเนอร์เตือน", "ตอนเปิดแอปเท่านั้น"),
               S("i", "L", "e", "rect", "เก็บถาวร", "p_archive = true")],
         edges=[E("a", "b", "SELECT", net=True), E("b", "c"), E("c", "d", "ยังไม่ถึง"), E("c", "h", "ถึง"),
                E("h", "d", "ต่อ"), E("d", "e"), E("e", "f", "กรอก", net=True), E("e", "i", "ว่าง"),
                E("i", "f", "เก็บถาวร", net=True), E("f", "g")]),
    dict(slug="flow-size", path="/size-converter", title="ไซส์ไหนคือฉัน", desc="แปลงไซส์จากสัดส่วนจริงของโปรไฟล์หรือค่าที่กรอกเอง ผ่าน convert แล้วแสดงตารางไซส์ที่แนะนำ",
         main=[M("a", "oval", "เปิดตัวแปลงไซส์"),
               M("b", "diamond", "ใช้โปรไฟล์ที่บันทึก?", "ค่าเริ่มต้น: กรอกเอง"),
               M("c", "rect", "เลือกหมวด + เผื่อไซส์", "หน้าเท้ากว้าง / Oversize"),
               M("d", "rect", "convert()", "สัดส่วน → ตารางไซส์", focal=True),
               M("e", "diamond", "สัดส่วนครบไหม?", "อยู่ในช่วงตาราง"),
               M("f", "oval", "ตารางไซส์ + ที่แนะนำ")],
         side=[S("g", "R", "b", "rect", "กรอกเอง + ตรวจช่วงค่า", "parseMeasures → cm/mm"),
               S("h", "L", "e", "rect", "บอกช่องที่ขาด / นอกช่วง", "ไม่เดาค่าให้")],
         edges=[E("a", "b"), E("b", "c", "ใช้โปรไฟล์", net=True), E("b", "g", "กรอกเอง"), E("g", "c", "cm / mm"),
                E("c", "d"), E("d", "e"), E("e", "f", "ครบ"), E("e", "h", "ไม่ครบ"), E("h", "c", "กรอกเพิ่ม")]),
    dict(slug="flow-mood", path="/mood", title="ตัวฉันวันนี้", desc="บันทึกอารมณ์ด้วยอิโมจิ แสดงการ์ดปลอบใจเมื่อคะแนนต่ำ แล้วบันทึกแท็กและข้อความไปที่ปฏิทิน",
         main=[M("a", "oval", "แตะอิโมจิ 1–5"),
               M("b", "rect", "บันทึกอารมณ์วันนี้", "upsert (user_id, entry_date)"),
               M("c", "diamond", "คะแนน ≤ 2?", focal=True),
               M("d", "rect", "เลือกแท็ก + ข้อความ", "แท็กของผู้ใช้ · ≤100 ตัวอักษร"),
               M("e", "diamond", "ข้อมูลถูกต้อง?", "normalizeDetails"),
               M("f", "rect", "บันทึกรายละเอียด", "upsert tags + note"),
               M("g", "oval", "ไปปฏิทิน /mood/calendar")],
         side=[S("h", "R", "c", "rect", "การ์ดปลอบใจ", "ดิ่ง 3 วันติด + เบอร์ 1323"),
               S("i", "L", "e", "rect", "แจ้ง error ใต้ช่อง", "ข้อความยาวเกิน 100")],
         edges=[E("a", "b"), E("b", "c", "UPSERT", net=True), E("c", "d", "สูงกว่า 2"), E("c", "h", "ต่ำ"),
                E("h", "d", "ต่อ"), E("d", "e"), E("e", "f", "ผ่าน", net=True), E("e", "i", "ไม่ผ่าน"),
                E("i", "d", "แก้ไข"), E("f", "g")]),
    dict(slug="flow-lucky", path="/lucky-color", title="สีที่ใช่", desc="คำนวณสีมงคลจากวันเกิดและวันปัจจุบันด้วยทักษา 2 ชั้น แล้วแสดงสีปังคูณสอง สีเสริม และสีต้องห้าม",
         main=[M("a", "oval", "เปิด /lucky-color"),
               M("b", "rect", "โหลดวันเกิดที่บันทึกไว้", "lucky_color_profiles"),
               M("c", "diamond", "มีวันเกิดไหม?"),
               M("d", "rect", "หาวันทักษาปัจจุบัน", "ถอย 6 ชม. · แยกพุธกลางวัน/คืน"),
               M("e", "rect", "สร้างวงล้อ 8 ช่อง ×2", "วงของวันเกิด และของวันนี้"),
               M("f", "rect", "ตัดกาลกิณี + หาสีดี", "ปังคูณสอง / สีเสริม / ต้องห้าม", focal=True),
               M("g", "oval", "แสดงผล 3 ส่วน")],
         side=[S("h", "R", "c", "rect", "เลือกวันเกิด 8 แบบ", "พุธกลางวัน/กลางคืนแยกกัน"),
               S("i", "L", "g", "rect", "เลือกวันเกิดอื่น", "บันทึกเบื้องหลัง (upsert)")],
         edges=[E("a", "b", "SELECT", net=True), E("b", "c"), E("c", "d", "มี"), E("c", "h", "ไม่มี"),
                E("h", "d", "เลือกแล้ว"), E("d", "e"), E("e", "f"), E("f", "g"), E("g", "i", "เปลี่ยน"),
                E("i", "d", "คำนวณใหม่")]),
]

CSS = """
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --color-paper: #f5f5f5; --color-ink: #2d3142; --color-muted: #4f5d75; --color-rule: rgba(45,49,66,0.14);
      --font-sans: 'Geist', 'Noto Sans Thai', system-ui, sans-serif;
      --font-serif: 'Instrument Serif', 'Noto Sans Thai', serif;
      --font-mono: 'Geist Mono', 'Noto Sans Thai', ui-monospace, monospace;
    }
    body { font-family: var(--font-sans); background: var(--color-paper); color: var(--color-ink); padding: 3rem 2rem; }
    .frame { max-width: 1200px; width: 100%; margin: 0 auto; }
    .diagram-container { width: 100%; overflow-x: auto; }
    .eyebrow { font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-muted); margin-bottom: 0.5rem; }
    h1 { font-family: var(--font-serif); font-size: clamp(1.75rem, 2.4vw + 0.75rem, 2.5rem); font-weight: 400; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 0.75rem; }
    h2 { font-family: var(--font-serif); font-size: clamp(1.5rem, 2vw + 0.75rem, 2rem); font-weight: 400; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 0.4rem; }
    .lead { color: var(--color-muted); font-size: 0.95rem; line-height: 1.6; max-width: 62ch; margin-bottom: 1.5rem; }
    nav { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0; border-top: 1px solid var(--color-rule); margin-bottom: 3rem; }
    nav a { display: block; padding: 0.7rem 0.25rem; border-bottom: 1px solid var(--color-rule); color: var(--color-ink); text-decoration: none; font-size: 0.9rem; }
    nav a span { display: block; font-family: var(--font-mono); font-size: 0.66rem; color: var(--color-muted); letter-spacing: 0.06em; }
    nav a:hover { background: rgba(45,49,66,0.04); }
    section { padding-top: 2.5rem; margin-top: 2.5rem; border-top: 1px solid var(--color-rule); }
    svg { width: 100%; min-width: 960px; display: block; }
    @media print { .diagram-container { overflow-x: visible; } svg { min-width: 0; } section { break-inside: avoid; } }
"""


def page():
    nav = "".join(f'<a href="#{f["slug"]}">{e(f["title"])}<span>{e(f["path"])}</span></a>' for f in FLOWS)
    secs = []
    for f in FLOWS:
        secs.append(f'<section id="{f["slug"]}"><p class="eyebrow">Flowchart · {e(f["path"])}</p><h2>{e(f["title"])}</h2>'
                    f'<p class="lead">{e(f["desc"])}</p><div class="diagram-container">{build(f)}</div></section>')
    return (f'<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
            f'<title>Flowchart รายฟีเจอร์</title>'
            f'<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&family=Noto+Sans+Thai:wght@400;500;600&display=swap" rel="stylesheet">'
            f'<style>{CSS}</style></head><body><div class="frame"><p class="eyebrow">Flowchart · Diagram Design</p>'
            f'<h1>Flowchart รายฟีเจอร์ของเสขาประจำวัน</h1>'
            f'<p class="lead">แผนผังการทำงานของแต่ละฟีเจอร์ที่ผู้ใช้เห็น เรียงตามลำดับในแอป สร้างจาก docs/spec/system-design.md</p>'
            f'<nav>{nav}</nav>{"".join(secs)}</div></body></html>').replace("><", ">\n<")


DEFAULT_OUT = "docs/spec/feature-flowcharts.html"

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(page())
    print("wrote", out)
