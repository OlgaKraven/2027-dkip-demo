"""Draw a product illustration for each exam and export four ordered PNG tiles."""

import json
from math import cos, pi, sin
from pathlib import Path

from PIL import Image, ImageDraw


TILE = 702
SCALE = 4 * TILE / 800
# Paper, secondary background, ink, primary fill, detail, accent.
PALETTES = (
    ('#f9e5cd', '#f0bb9b', '#293646', '#d86149', '#fef4dd', '#326f67'),
    ('#f4dcaa', '#b9a6cf', '#402c39', '#9b4c36', '#efb967', '#723b63'),
    ('#e6ebdb', '#a5c8ba', '#1e3b45', '#2b7b7e', '#f9f0ce', '#e9835c'),
    ('#e4dafa', '#bca9e3', '#302959', '#6353ae', '#fbf1ff', '#f3a043'),
    ('#eed4bd', '#c0af97', '#292e3c', '#986044', '#fff2de', '#476d81'),
    ('#f4e0d5', '#e9b8cb', '#51354c', '#a05170', '#fff5dc', '#f4a647'),
    ('#dce9f4', '#96b6ce', '#243950', '#4e7296', '#ecfaff', '#ef985a'),
    ('#dbead2', '#99b79a', '#263b42', '#577f60', '#f7ebc5', '#cf5d51'),
    ('#eee5ba', '#c4c896', '#313a2d', '#a06a32', '#fff5d7', '#477d77'),
    ('#f2d9dc', '#d99bad', '#453143', '#a54159', '#fff1df', '#5b7b9b'),
)
# Each entry binds a variant to its own subject, palette and background layout.
ART_DIRECTION = {
    'V01': ('apron', 0, 0), 'V02': ('bread', 1, 1), 'V03': ('mug', 2, 2),
    'V04': ('notebook', 3, 3), 'V05': ('wallet', 4, 4), 'V06': ('candle', 5, 2),
    'V07': ('soap', 3, 1), 'V08': ('slippers', 7, 4), 'V09': ('chocolates', 1, 0),
    'V10': ('blocks', 8, 3), 'V11': ('circuit', 7, 5), 'V12': ('bracket', 6, 5),
    'V13': ('gift', 9, 1), 'V14': ('sign', 2, 3), 'V15': ('flowers', 8, 2),
    'V16': ('pendant', 3, 0), 'V17': ('glass', 0, 5), 'V18': ('cushion', 5, 4),
    'V19': ('expander', 9, 0), 'V20': ('tote', 2, 4), 'V21': ('catbed', 1, 3),
    'V22': ('planter', 6, 2), 'V23': ('boardgame', 8, 5), 'V24': ('frame', 4, 0),
    'V25': ('lamp', 6, 1), 'V26': ('magnet', 0, 3), 'V27': ('kalimba', 4, 1),
    'V28': ('binder', 9, 5), 'V29': ('enclosure', 3, 4), 'V30': ('tea', 7, 2),
}


def product_art(image, subject, colors, backdrop):
    paper, field, ink, main, light, accent = colors
    draw = ImageDraw.Draw(image)

    def point(x, y):
        return round(x * SCALE), round(y * SCALE)

    def box(bounds, fill, radius=0):
        x0, y0, x1, y1 = bounds
        draw.rounded_rectangle([point(x0, y0), point(x1, y1)], radius=round(radius*SCALE), fill=fill)

    def oval(bounds, fill):
        x0, y0, x1, y1 = bounds
        draw.ellipse([point(x0, y0), point(x1, y1)], fill=fill)

    def dot(x, y, radius, fill):
        oval((x-radius, y-radius, x+radius, y+radius), fill)

    def polygon(points, fill):
        draw.polygon([point(*xy) for xy in points], fill=fill)

    def line(points, fill, width=8):
        draw.line([point(*xy) for xy in points], fill=fill, width=round(width*SCALE), joint='curve')

    if backdrop == 0:
        polygon([(0, 0), (800, 0), (800, 270), (0, 590)], field)
        line([(0, 680), (800, 350)], light, 22)
    elif backdrop == 1:
        dot(392, 372, 365, field)
        dot(392, 372, 312, paper)
        dot(392, 372, 286, light)
    elif backdrop == 2:
        box((78, 65, 722, 735), field, 245)
        box((114, 101, 686, 699), light, 217)
        line([(78, 634), (722, 634)], field, 18)
    elif backdrop == 3:
        box((0, 469, 800, 800), field)
        polygon([(0, 469), (800, 358), (800, 469)], light)
        for x in range(65, 800, 108):
            line([(x, 682), (x+75, 800)], light, 6)
    elif backdrop == 4:
        for n in range(-800, 900, 148):
            line([(n, 0), (n+800, 800)], field, 54)
        box((113, 110, 700, 694), light, 176)
    else:
        box((0, 0, 800, 800), field)
        for y in range(54, 800, 51):
            for x in range(54, 800, 51):
                dot(x, y, 3, ink)
        polygon([(80, 248), (571, 82), (752, 569), (261, 735)], light)

    for x, y, radius in [(123, 162, 13), (673, 221, 9), (125, 581, 10), (688, 638, 17)]:
        dot(x, y, radius, accent)

    if subject == 'apron':
        oval((294, 111, 506, 374), ink)
        oval((315, 132, 485, 352), field)
        line([(168, 462), (315, 420), (489, 421), (641, 474)], ink, 24)
        polygon([(302, 242), (493, 242), (530, 384), (603, 645), (212, 645), (271, 383)], main)
        box((326, 438, 481, 554), light, 22)
        line([(247, 610), (567, 610)], ink, 9)
    elif subject == 'bread':
        box((149, 273, 658, 581), ink, 123)
        box((157, 236, 658, 531), main, 133)
        for x in [244, 354, 464]:
            line([(x, 407), (x+65, 298)], light, 24)
        dot(577, 460, 10, accent)
    elif subject == 'mug':
        oval((431, 299, 674, 551), ink)
        oval((455, 324, 646, 527), light)
        box((192, 248, 522, 610), main, 76)
        oval((192, 211, 522, 302), ink)
        oval((212, 226, 502, 281), accent)
        line([(238, 464), (476, 464)], light, 24)
        line([(241, 511), (474, 511)], light, 9)
    elif subject == 'notebook':
        polygon([(261, 160), (607, 224), (536, 647), (188, 584)], ink)
        polygon([(249, 145), (588, 208), (518, 618), (176, 556)], main)
        polygon([(310, 261), (501, 296), (486, 379), (295, 344)], light)
        for y in range(193, 542, 62):
            line([(212-(y-190)/5, y), (256-(y-190)/5, y+9)], accent, 14)
    elif subject == 'wallet':
        box((161, 305, 643, 592), ink, 48)
        box((183, 290, 626, 560), main, 39)
        box((258, 236, 548, 405), accent, 21)
        box((320, 192, 584, 363), light, 21)
        box((185, 368, 626, 550), main, 28)
        line([(206, 441), (595, 441)], light, 8)
        line([(211, 512), (587, 512)], ink, 7)
    elif subject == 'candle':
        box((240, 296, 568, 629), main, 74)
        oval((240, 259, 568, 339), ink)
        oval((262, 272, 545, 328), light)
        line([(403, 293), (403, 230)], ink, 11)
        polygon([(398, 148), (440, 222), (402, 258), (366, 226)], accent)
        box((293, 424, 511, 527), light, 19)
        dot(402, 476, 28, main)
    elif subject == 'soap':
        box((172, 326, 604, 592), ink, 96)
        box((170, 291, 604, 546), main, 105)
        line([(236, 467), (549, 467)], light, 10)
        line([(297, 434), (465, 337)], light, 8)
        for x, y in [(330, 396), (366, 376), (406, 353), (446, 332)]:
            oval((x-17, y-29, x+19, y+7), accent)
        dot(563, 239, 38, light)
        dot(642, 332, 22, accent)
    elif subject == 'slippers':
        box((173, 202, 380, 613), ink, 102)
        box((421, 175, 628, 588), ink, 102)
        box((189, 187, 370, 532), main, 91)
        box((434, 159, 614, 506), accent, 90)
        box((214, 409, 346, 565), light, 60)
        box((457, 385, 588, 540), light, 60)
    elif subject == 'chocolates':
        box((172, 194, 633, 622), ink, 40)
        box((189, 211, 616, 604), light, 24)
        for row in range(3):
            for col in range(4):
                x, y = 249+col*100, 280+row*124
                dot(x, y, 40, main)
                line([(x-16, y+10), (x+15, y-12)], [accent, paper][(row+col)%2], 8)
    elif subject == 'blocks':
        for x, y, color in [(226, 361, main), (411, 263, accent), (461, 469, ink)]:
            polygon([(x, y), (x+98, y-57), (x+194, y), (x+96, y+56)], light)
            polygon([(x, y), (x+96, y+56), (x+96, y+168), (x, y+113)], color)
            polygon([(x+96, y+56), (x+194, y), (x+194, y+113), (x+96, y+168)], ink)
    elif subject == 'circuit':
        box((166, 202, 635, 597), ink, 45)
        box((181, 218, 618, 581), main, 31)
        for x, y in [(222, 258), (578, 258), (222, 541), (578, 541)]:
            dot(x, y, 15, light)
            line([(x, y), (400, y), (400, 402)], light, 6)
        box((302, 322, 498, 475), ink, 16)
        for y in range(343, 465, 31):
            line([(271, y), (301, y)], light, 9)
            line([(499, y), (530, y)], light, 9)
        box((353, 356, 447, 444), accent, 11)
    elif subject == 'bracket':
        polygon([(160, 425), (454, 243), (661, 331), (375, 520)], light)
        polygon([(160, 425), (375, 520), (375, 584), (160, 485)], main)
        polygon([(375, 520), (661, 331), (661, 399), (375, 584)], ink)
        polygon([(459, 170), (661, 257), (661, 331), (459, 457)], main)
        polygon([(459, 170), (499, 142), (661, 257), (459, 202)], ink)
        for x, y in [(253, 440), (354, 452), (557, 296)]:
            oval((x-24, y-12, x+24, y+12), ink)
    elif subject == 'gift':
        box((197, 298, 610, 610), ink, 34)
        box((200, 280, 610, 584), main, 32)
        box((176, 255, 633, 346), main, 20)
        oval((257, 146, 410, 273), accent)
        oval((395, 144, 547, 273), accent)
        box((379, 255, 430, 584), light, 9)
        box((199, 420, 610, 464), light)
    elif subject == 'sign':
        polygon([(201, 286), (608, 286), (688, 561), (128, 561)], ink)
        polygon([(231, 262), (576, 262), (639, 521), (166, 521)], main)
        line([(285, 400), (514, 400)], light, 22)
        line([(327, 446), (470, 446)], accent, 12)
        dot(270, 323, 10, light)
        dot(528, 323, 10, light)
    elif subject == 'flowers':
        for x, y in [(230, 265), (331, 177), (439, 225), (548, 192), (593, 322)]:
            line([(396, 530), (x, y)], ink, 9)
            dot(x, y, 39, main)
            for angle in range(0, 360, 60):
                dot(x+34*cos(angle*pi/180), y+34*sin(angle*pi/180), 18, accent)
            dot(x, y, 14, light)
        polygon([(269, 469), (522, 469), (490, 643), (310, 643)], main)
        box((251, 459, 543, 510), light, 16)
    elif subject == 'pendant':
        line([(138, 135), (226, 238), (402, 328), (572, 230), (665, 137)], ink, 14)
        dot(402, 346, 35, accent)
        polygon([(399, 371), (552, 486), (396, 660), (257, 490)], ink)
        polygon([(399, 389), (519, 488), (396, 628), (282, 490)], main)
        polygon([(399, 389), (449, 484), (396, 628), (349, 484)], light)
    elif subject == 'glass':
        dot(398, 399, 233, ink)
        dot(398, 399, 216, main)
        center = (365, 412)
        for index in range(8):
            angle = index*pi/4
            next_angle = angle+pi/4
            polygon([center, (398+213*cos(angle), 399+213*sin(angle)),
                     (398+213*cos(next_angle), 399+213*sin(next_angle))],
                    [accent, light, main, field][index%4])
        for index in range(8):
            angle = index*pi/4
            line([center, (398+217*cos(angle), 399+217*sin(angle))], ink, 10)
    elif subject == 'cushion':
        box((162, 227, 651, 611), ink, 108)
        box((178, 222, 637, 586), main, 100)
        box((214, 258, 600, 550), accent, 81)
        polygon([(411, 278), (573, 402), (407, 531), (241, 404)], light)
        polygon([(411, 324), (518, 402), (407, 484), (297, 404)], main)
    elif subject == 'expander':
        line([(234, 313), (349, 474), (468, 467), (576, 302)], ink, 35)
        line([(231, 329), (349, 491), (468, 484), (576, 318)], accent, 15)
        box((127, 224, 303, 376), main, 62)
        box((498, 211, 675, 363), main, 62)
        box((158, 263, 275, 319), light, 20)
        box((528, 250, 645, 306), light, 20)
        box((337, 449, 484, 510), ink, 19)
    elif subject == 'tote':
        oval((273, 141, 527, 493), ink)
        oval((303, 167, 497, 465), light)
        polygon([(177, 307), (626, 307), (590, 639), (220, 639)], main)
        polygon([(272, 461), (411, 347), (550, 461), (410, 576)], light)
        dot(410, 462, 47, accent)
        line([(235, 607), (575, 607)], ink, 8)
    elif subject == 'catbed':
        oval((140, 363, 663, 646), ink)
        oval((142, 335, 658, 602), main)
        oval((188, 363, 607, 553), light)
        oval((249, 349, 570, 507), accent)
        dot(345, 385, 75, accent)
        polygon([(277, 362), (279, 271), (342, 331), (387, 314), (437, 258), (424, 366)], accent)
        line([(323, 397), (350, 406)], ink, 6)
    elif subject == 'planter':
        for x, y in [(245, 192), (359, 135), (455, 168), (563, 234)]:
            line([(405, 472), (x, y)], ink, 10)
            oval((x-47, y-52, x+57, y+50), [main, accent][x%2])
        polygon([(232, 387), (569, 387), (511, 638), (292, 638)], main)
        box((210, 368, 593, 443), ink, 18)
        polygon([(260, 465), (540, 465), (523, 532), (277, 532)], light)
    elif subject == 'boardgame':
        box((176, 179, 643, 641), ink, 38)
        box((191, 194, 626, 624), light, 24)
        points = [(255, 547), (344, 547), (344, 432), (485, 432), (485, 331), (555, 331), (555, 264)]
        line(points, main, 34)
        for x, y in points:
            dot(x, y, 25, main)
            dot(x, y, 15, light)
        dot(344, 432, 31, accent)
        dot(555, 264, 28, ink)
    elif subject == 'frame':
        box((202, 135, 602, 661), ink, 16)
        box((219, 153, 585, 643), main, 9)
        box((249, 184, 554, 613), light)
        box((273, 208, 532, 590), accent)
        dot(444, 315, 50, light)
        polygon([(273, 531), (385, 344), (532, 544), (532, 590), (273, 590)], ink)
        polygon([(273, 558), (445, 415), (532, 541), (532, 590), (273, 590)], main)
    elif subject == 'lamp':
        polygon([(329, 416), (461, 416), (678, 615), (125, 615)], light)
        line([(426, 604), (507, 467), (435, 247)], ink, 29)
        box((279, 587, 559, 643), main, 24)
        polygon([(323, 197), (469, 197), (570, 421), (220, 421)], main)
        oval((222, 392, 568, 450), accent)
        dot(396, 421, 28, light)
        box((300, 610, 546, 648), ink, 16)
    elif subject == 'magnet':
        box((191, 214, 615, 610), ink, 55)
        box((202, 210, 604, 591), main, 48)
        box((226, 234, 580, 567), light, 32)
        dot(474, 329, 53, accent)
        polygon([(226, 504), (356, 332), (468, 518), (526, 433), (580, 500), (580, 546), (226, 546)], ink)
        line([(262, 523), (350, 523)], main, 12)
    elif subject == 'kalimba':
        box((196, 185, 604, 655), ink, 105)
        box((209, 166, 591, 637), main, 98)
        dot(398, 467, 65, ink)
        box((235, 274, 566, 300), ink, 9)
        for i, height in enumerate([128, 158, 190, 226, 226, 190, 158, 128]):
            x = 255+39*i
            box((x, 224, x+23, 224+height), light, 7)
        line([(279, 565), (521, 565)], accent, 14)
    elif subject == 'binder':
        polygon([(143, 243), (344, 243), (394, 290), (629, 290), (629, 608), (143, 608)], ink)
        box((235, 173, 565, 484), light, 26)
        for y in range(230, 373, 39):
            line([(281, y), (513, y)], accent, 9)
        polygon([(166, 382), (667, 382), (618, 589), (153, 589)], main)
        box((346, 454, 493, 510), light, 12)
    elif subject == 'enclosure':
        polygon([(168, 308), (391, 186), (638, 302), (415, 432)], main)
        polygon([(168, 308), (415, 432), (415, 622), (168, 497)], ink)
        polygon([(415, 432), (638, 302), (638, 490), (415, 622)], accent)
        polygon([(236, 306), (391, 224), (573, 306), (414, 397)], light)
        for i in range(3):
            line([(198, 374+i*39), (385, 470+i*39)], light, 7)
        oval((492, 431, 568, 496), ink)
    elif subject == 'tea':
        box((151, 255, 650, 596), ink, 36)
        box((167, 270, 634, 578), main, 20)
        for index, color in enumerate([light, accent, field]):
            x = 216+135*index
            box((x, 319, x+108, 532), color, 24)
            line([(x+12, 363), (x+96, 363)], ink, 8)
            oval((x+26, 405, x+78, 455), main)
            line([(x+35, 447), (x+69, 414)], color, 5)
    else:
        raise ValueError(f'Unknown puzzle subject: {subject}')


def prepare_puzzles(root):
    variants = json.loads((root/'content/variants.json').read_text(encoding='utf8'))
    if {variant['id'] for variant in variants} != ART_DIRECTION.keys():
        raise ValueError('Every exam variant must have an illustration')
    for variant in variants:
        subject, palette, backdrop = ART_DIRECTION[variant['id']]
        colors = PALETTES[palette]
        image = Image.new('RGB', (TILE*4, TILE*4), colors[0])
        product_art(image, subject, colors, backdrop)
        image = image.resize((TILE*2, TILE*2), Image.Resampling.LANCZOS)
        folder = root/'content/variants'/variant['id']/'Пазл'
        folder.mkdir(exist_ok=True)
        for number, (left, top) in enumerate([(0, 0), (TILE, 0), (0, TILE), (TILE, TILE)], 1):
            image.crop((left, top, left+TILE, top+TILE)).save(folder/f'{number}.png', optimize=True)


if __name__ == '__main__':
    prepare_puzzles(Path(__file__).resolve().parents[1])
