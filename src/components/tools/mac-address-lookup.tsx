"use client";

import { useState } from "react";

const OUI_DB: Record<string, string> = {
  "00000C": "Cisco", "000142": "Cisco", "00036B": "Cisco", "000496": "Cisco",
  "000500": "Cisco", "000A41": "Cisco", "000BBE": "Cisco", "000DBC": "Cisco",
  "000E38": "Cisco", "000ED7": "Cisco", "001121": "Cisco", "001200": "Cisco",
  "001319": "Cisco", "00146A": "Cisco", "001646": "Cisco", "00170E": "Cisco",
  "001873": "Cisco", "0019AA": "Cisco", "001AA1": "Cisco", "001B0C": "Cisco",
  "001C0E": "Cisco", "001D45": "Cisco", "001E13": "Cisco", "001E4A": "Cisco",
  "002155": "Cisco", "002255": "Cisco", "002304": "Cisco", "002333": "Cisco",
  "00235D": "Cisco", "002413": "Cisco", "002545": "Cisco", "00260A": "Cisco",
  "002651": "Cisco", "002698": "Cisco", "00270C": "Cisco", "0028F8": "Cisco",
  "002A10": "Cisco", "002BE8": "Cisco", "002CC8": "Cisco", "002EC7": "Cisco",
  "003071": "Cisco", "003080": "Cisco", "0030F2": "Cisco", "003104": "Cisco",
  "004096": "Cisco", "004252": "Cisco",
  "005056": "VMware", "000C29": "VMware", "000569": "VMware", "001C14": "VMware", "005057": "VMware",
  "00155D": "Microsoft Hyper-V", "001DD8": "Microsoft", "7C1E52": "Microsoft",
  "0003FF": "Microsoft", "281878": "Microsoft", "B831B5": "Microsoft",
  "00123F": "Dell", "001422": "Dell", "0015C5": "Dell", "00188B": "Dell",
  "001AA0": "Dell", "001B44": "Dell", "001C23": "Dell", "001E4F": "Dell",
  "002170": "Dell", "002219": "Dell", "002318": "Dell", "0024E8": "Dell",
  "002564": "Dell", "0026B9": "Dell", "002713": "Dell", "00B0D0": "Dell",
  "141877": "Dell", "180373": "Dell", "1866DA": "Dell", "2047F7": "Dell",
  "246E96": "Dell", "28F10E": "Dell", "2C44FD": "Dell", "30D042": "Dell",
  "3417EB": "Dell", "34E0CF": "Dell", "38DBBB": "Dell", "3CD92B": "Dell",
  "40A8F0": "Dell", "44A842": "Dell", "484D7E": "Dell", "4CECEF": "Dell",
  "509A4C": "Dell", "54BF64": "Dell", "5882A8": "Dell", "5C260A": "Dell",
  "601895": "Dell", "64006A": "Dell", "684F64": "Dell", "6C886A": "Dell",
  "7006AC": "Dell", "74867A": "Dell", "782B46": "Dell",
  "801844": "Dell", "847FB8": "Dell", "848F69": "Dell", "886FD1": "Dell",
  "8CEC4B": "Dell", "90B11C": "Dell", "94DB56": "Dell", "989096": "Dell",
  "9CEBE8": "Dell", "A0481C": "Dell", "A41F72": "Dell", "A4BADB": "Dell",
  "A898C6": "Dell", "ACDE48": "Dell", "B046FC": "Dell", "B083FE": "Dell",
  "B42E99": "Dell", "B82A72": "Dell", "BC305B": "Dell", "C03F0E": "Dell",
  "C08D59": "Dell", "C4144C": "Dell", "C81F66": "Dell", "CC03FA": "Dell",
  "CC52AF": "Dell", "D023DB": "Dell", "D09466": "Dell", "D4AE52": "Dell",
  "D89B3B": "Dell", "E0DB10": "Dell", "E4F004": "Dell",
  "E86A35": "Dell", "ECA86B": "Dell", "F01FAF": "Dell", "F04DA2": "Dell",
  "F48E38": "Dell", "F8BC12": "Dell", "FC15B4": "Dell",
  "001E65": "Apple", "002241": "Apple", "002312": "Apple", "002436": "Apple",
  "002500": "Apple", "002608": "Apple", "0026BB": "Apple", "002710": "Apple",
  "0028F7": "Apple", "003065": "Apple", "0050E4": "Apple", "040CCE": "Apple",
  "080007": "Apple", "0C2026": "Apple", "1040F3": "Apple", "1093E9": "Apple",
  "147DDA": "Apple", "18AF61": "Apple", "1C36BB": "Apple",
  "2078F0": "Apple", "20EE28": "Apple", "24A2E1": "Apple", "283737": "Apple",
  "285FBF": "Apple", "2CBE08": "Apple", "3010E4": "Apple", "3035AD": "Apple",
  "34C3AC": "Apple", "38F9D3": "Apple", "3C15C2": "Apple", "3CE072": "Apple",
  "403004": "Apple", "409F38": "Apple", "440010": "Apple", "442CA5": "Apple",
  "48437C": "Apple", "4C3275": "Apple", "50EAF6": "Apple", "542696": "Apple",
  "549F13": "Apple", "581122": "Apple", "5C5F67": "Apple",
  "609217": "Apple", "60C547": "Apple", "645A04": "Apple", "64A68F": "Apple",
  "685B35": "Apple", "68E82E": "Apple", "6C4D73": "Apple", "6C96CF": "Apple",
  "705681": "Apple", "70E782": "Apple", "741BB2": "Apple", "74888A": "Apple",
  "7831C1": "Apple", "786C1C": "Apple", "7CD1C3": "Apple", "7CED8D": "Apple",
  "84B153": "Apple", "8866A5": "Apple", "88E9FE": "Apple",
  "8C8590": "Apple", "9027E4": "Apple", "94659C": "Apple",
  "94E979": "Apple", "9801A7": "Apple", "98E182": "Apple", "9C207B": "Apple",
  "9CF387": "Apple", "A0997B": "Apple", "A45E60": "Apple", "A4D18C": "Apple",
  "A8516B": "Apple", "A886DD": "Apple", "ACBC32": "Apple", "B03495": "Apple",
  "B0481A": "Apple", "B0702D": "Apple", "B09FB9": "Apple", "B48BAF": "Apple",
  "B4F0AB": "Apple", "B8098A": "Apple", "B817C2": "Apple",
  "B84144": "Apple", "B8C111": "Apple", "B8E856": "Apple", "BC52B7": "Apple",
  "C0B658": "Apple", "C42C03": "Apple", "C4618B": "Apple", "C48466": "Apple",
  "C82A14": "Apple", "C869CD": "Apple", "C8B373": "Apple", "C8E130": "Apple",
  "CC088D": "Apple", "D0034B": "Apple", "D03311": "Apple", "D0817A": "Apple",
  "D4619D": "Apple", "D49A20": "Apple", "D83062": "Apple", "D8BBC1": "Apple",
  "DC2B2A": "Apple", "DCA4CA": "Apple", "E0C767": "Apple",
  "E425E7": "Apple", "E45F01": "Apple", "E8040B": "Apple", "E80688": "Apple",
  "ECFABC": "Apple", "F01898": "Apple", "F074E4": "Apple", "F0B479": "Apple",
  "F0D1A9": "Apple", "F0D6F7": "Apple", "F41C89": "Apple", "F45C89": "Apple",
  "F81EDF": "Apple", "F8A9D0": "Apple", "FC1794": "Apple", "FCE998": "Apple",
  "000E8F": "Netgear", "00146C": "Netgear", "00184D": "Netgear", "001B2F": "Netgear",
  "001F33": "Netgear", "00223F": "Netgear", "0024B2": "Netgear", "0026F2": "Netgear",
  "009F52": "Netgear", "04A42A": "Netgear", "0836C9": "Netgear", "0C3E9F": "Netgear",
  "100C6B": "Netgear", "10DA43": "Netgear", "1459C0": "Netgear", "18E829": "Netgear",
  "200CC8": "Netgear", "204E7F": "Netgear", "20E52A": "Netgear",
  "240A04": "Netgear", "28C68E": "Netgear", "2CB05D": "Netgear", "2CB43A": "Netgear",
  "30469A": "Netgear", "3498B5": "Netgear",
  "404A03": "Netgear", "40BD32": "Netgear", "4494FC": "Netgear", "4806C4": "Netgear",
  "4C60DE": "Netgear", "504A17": "Netgear",
  "5422F8": "Netgear", "58EF68": "Netgear", "5C3C27": "Netgear",
  "6466B3": "Netgear", "684F25": "Netgear", "6CB0CE": "Netgear", "704D7B": "Netgear",
  "74ACB9": "Netgear", "78D25E": "Netgear", "803773": "Netgear", "841B5E": "Netgear",
  "88DC96": "Netgear", "8C3BAD": "Netgear",
  "94103E": "Netgear",
  "98FC11": "Netgear", "9C3DCF": "Netgear", "9CD643": "Netgear", "A00460": "Netgear",
  "A021B7": "Netgear", "A42B8C": "Netgear", "A45046": "Netgear", "A45630": "Netgear",
  "A8725D": "Netgear", "AC2205": "Netgear", "AC8112": "Netgear", "B07FB9": "Netgear",
  "B0B98A": "Netgear", "B43052": "Netgear", "B8BF6F": "Netgear", "BCEE7B": "Netgear",
  "C0FFD4": "Netgear", "C40415": "Netgear", "C43DC7": "Netgear", "C83A35": "Netgear",
  "CC40D0": "Netgear", "D021F9": "Netgear", "D46E5C": "Netgear", "D8FC93": "Netgear",
  "DCEF09": "Netgear", "E0469A": "Netgear", "E04F43": "Netgear", "E091F5": "Netgear",
  "E4F4C6": "Netgear", "E8FCAF": "Netgear", "EC1D8B": "Netgear", "F0010C": "Netgear",
  "F063DF": "Netgear", "F4A475": "Netgear", "F4B52F": "Netgear", "F87394": "Netgear",
  "FCFBFB": "Netgear",
  "000E58": "TP-Link", "0014BF": "TP-Link", "001900": "TP-Link", "001D0F": "TP-Link",
  "002127": "TP-Link", "0023CD": "TP-Link", "002586": "TP-Link", "00265A": "TP-Link",
  "002719": "TP-Link", "04A741": "TP-Link", "084F0A": "TP-Link", "087808": "TP-Link",
  "0C725C": "TP-Link", "0CDA41": "TP-Link", "10FEED": "TP-Link", "1422E4": "TP-Link",
  "144D67": "TP-Link", "14CC20": "TP-Link", "14CF92": "TP-Link", "14E6E4": "TP-Link",
  "14EBB6": "TP-Link", "18A6F7": "TP-Link", "18C58A": "TP-Link",
  "1CB72C": "TP-Link", "1F3FC7": "TP-Link", "206BE7": "TP-Link", "20DCE6": "TP-Link",
  "24050F": "TP-Link", "282CB2": "TP-Link", "2C0E3D": "TP-Link", "2C3A28": "TP-Link",
  "304596": "TP-Link", "30B5C2": "TP-Link", "340804": "TP-Link", "342EB7": "TP-Link",
  "3460F9": "TP-Link", "3496FB": "TP-Link", "34CDBE": "TP-Link",
  "3872C0": "TP-Link", "3C12AF": "TP-Link", "40ED98": "TP-Link", "44334C": "TP-Link",
  "4455B1": "TP-Link", "446EAF": "TP-Link", "44D1FA": "TP-Link",
  "44C306": "TP-Link", "48022A": "TP-Link", "4811F8": "TP-Link",
  "48D705": "TP-Link", "48E244": "TP-Link", "4C09B4": "TP-Link", "4C189D": "TP-Link",
  "4CEDFB": "TP-Link", "50C7BF": "TP-Link", "50A4C8": "TP-Link", "50E47B": "TP-Link",
  "54C80F": "TP-Link", "54F54C": "TP-Link", "5832C3": "TP-Link", "5856C3": "TP-Link",
  "587F66": "TP-Link", "58FB84": "TP-Link", "5C0979": "TP-Link", "5C313E": "TP-Link",
  "5CA48D": "TP-Link", "5CE931": "TP-Link", "6032B1": "TP-Link", "60E327": "TP-Link",
  "60CC68": "TP-Link", "647002": "TP-Link",
  "64735B": "TP-Link", "64DB18": "TP-Link", "68109D": "TP-Link", "683693": "TP-Link",
  "68725B": "TP-Link", "6C38A0": "TP-Link", "6C5AB0": "TP-Link", "6CE873": "TP-Link",
  "702F4B": "TP-Link", "7445CE": "TP-Link", "74D02B": "TP-Link", "74DA88": "TP-Link",
  "78312B": "TP-Link", "788CB5": "TP-Link", "78A106": "TP-Link", "78BEB6": "TP-Link",
  "78D7AF": "TP-Link", "78F889": "TP-Link", "7C210D": "TP-Link",
  "7CC3A5": "TP-Link", "7CE044": "TP-Link", "804B20": "TP-Link",
  "80704A": "TP-Link", "84160C": "TP-Link", "843219": "TP-Link",
  "84D675": "TP-Link", "84DD20": "TP-Link", "882593": "TP-Link", "8C210A": "TP-Link",
  "8CB82C": "TP-Link", "901337": "TP-Link", "904843": "TP-Link", "907841": "TP-Link",
  "90F1AA": "TP-Link", "94D9B3": "TP-Link", "94E8C5": "TP-Link", "94FE22": "TP-Link",
  "98072D": "TP-Link", "981333": "TP-Link", "9832CD": "TP-Link", "987E46": "TP-Link",
  "98DAC4": "TP-Link", "9C2111": "TP-Link", "9CA525": "TP-Link", "9CB6D0": "TP-Link",
  "9CE895": "TP-Link", "A0369C": "TP-Link", "A06090": "TP-Link", "A0B439": "TP-Link",
  "A0F3C1": "TP-Link", "A42BB0": "TP-Link", "A43716": "TP-Link", "A48D3B": "TP-Link",
  "A4CB28": "TP-Link", "A4E28F": "TP-Link", "A8154D": "TP-Link", "A84241": "TP-Link",
  "A85E45": "TP-Link", "AC15A2": "TP-Link", "AC220B": "TP-Link", "AC3A7A": "TP-Link",
  "AC84C6": "TP-Link", "ACF1DF": "TP-Link",
  "000DB9": "Linksys", "001150": "Linksys", "001310": "Linksys", "0016B6": "Linksys",
  "001839": "Linksys", "001A70": "Linksys", "001C10": "Linksys", "001EE5": "Linksys",
  "002040": "Linksys", "002129": "Linksys", "002369": "Linksys",
  "049F81": "Linksys", "08373A": "Linksys", "0CEF7C": "Linksys", "10BF48": "Linksys",
  "14130B": "Linksys",
  "1C14B3": "Linksys", "20AA25": "Linksys",
  "2401C7": "Linksys", "28CDC1": "Linksys", "2C4053": "Linksys", "302303": "Linksys",
  "345760": "Linksys", "3C189F": "Linksys", "44237D": "Linksys", "44AE05": "Linksys",
  "485B39": "Linksys", "4C7220": "Linksys", "501AC2": "Linksys", "547C79": "Linksys",
  "54A744": "Linksys", "586D8F": "Linksys", "5C0A5B": "Linksys", "6023A4": "Linksys",
  "64C944": "Linksys", "687F74": "Linksys", "6C504D": "Linksys", "70105F": "Linksys",
  "74DADA": "Linksys", "788A20": "Linksys", "7C101A": "Linksys",
  "84D47E": "Linksys", "8871B1": "Linksys", "8C108F": "Linksys", "902314": "Linksys",
  "909F33": "Linksys", "94D469": "Linksys", "9C305B": "Linksys", "9C8888": "Linksys",
  "A01B29": "Linksys", "A020A6": "Linksys", "A06391": "Linksys", "B047BF": "Linksys",
  "C05627": "Linksys", "C0C522": "Linksys", "C4411E": "Linksys", "C47154": "Linksys",
  "D0131E": "Linksys", "D096FF": "Linksys", "D401C3": "Linksys", "D80089": "Linksys",
  "E005C5": "Linksys", "E0247F": "Linksys", "E0553D": "Linksys", "E89F80": "Linksys",
  "F02174": "Linksys", "F0421C": "Linksys", "F09FC2": "Linksys", "F437B7": "Linksys",
  "F4631F": "Linksys", "FC55DC": "Linksys",
  "001302": "Intel", "001304": "Intel", "001305": "Intel", "001517": "Intel",
  "00166F": "Intel", "0016EA": "Intel", "0018DE": "Intel", "0019D1": "Intel",
  "001B21": "Intel", "001E74": "Intel",
  "001F3B": "Intel", "00215A": "Intel", "00216A": "Intel", "0022FA": "Intel",
  "002314": "Intel", "002324": "Intel", "0024D7": "Intel", "0026C6": "Intel",
  "00270E": "Intel", "048D38": "Intel", "081196": "Intel", "08152F": "Intel",
  "0C8126": "Intel", "1002B5": "Intel", "100BE9": "Intel", "101F74": "Intel",
  "14DAE9": "Intel", "183DA2": "Intel", "185680": "Intel",
  "1C721D": "Intel", "2016B9": "Intel",
  "20415A": "Intel", "207783": "Intel", "20826E": "Intel",
  "28D244": "Intel", "2C4138": "Intel", "2C6E85": "Intel",
  "303A64": "Intel", "3052CB": "Intel", "30CDA7": "Intel", "30E171": "Intel",
  "340286": "Intel", "3413E8": "Intel",
  "3891FB": "Intel", "38B1DB": "Intel", "38D547": "Intel", "3C22FB": "Intel",
  "3C4A92": "Intel", "3C58C2": "Intel", "3C970E": "Intel", "40A677": "Intel",
  "40B076": "Intel", "4403A7": "Intel", "4448B7": "Intel", "448500": "Intel",
  "44E04C": "Intel", "4851B7": "Intel", "48CB6E": "Intel",
  "502DB7": "Intel", "505BC2": "Intel", "5076AF": "Intel", "50EB6C": "Intel",
  "50EBF6": "Intel", "5425EA": "Intel", "5482A5": "Intel", "54E43A": "Intel",
  "5816D7": "Intel", "589630": "Intel", "58A839": "Intel", "58AC78": "Intel",
  "58B1DF": "Intel", "58E873": "Intel", "5C5015": "Intel", "5C5188": "Intel",
  "5C63BF": "Intel", "5C648E": "Intel", "5C6D20": "Intel", "5C7D5E": "Intel",
  "5CE0C5": "Intel", "6036DD": "Intel", "605718": "Intel", "606C66": "Intel",
  "607688": "Intel", "60818B": "Intel", "608D17": "Intel", "60A4B7": "Intel",
  "642737": "Intel", "6433B5": "Intel", "645106": "Intel",
  "645AED": "Intel", "646E69": "Intel", "647BCE": "Intel", "64A0A7": "Intel",
  "64D4BD": "Intel", "64D912": "Intel", "680571": "Intel", "680927": "Intel",
  "681401": "Intel", "681729": "Intel", "681EAF": "Intel", "6854FD": "Intel",
  "6899CD": "Intel", "68B599": "Intel", "68EA65": "Intel", "68F728": "Intel",
  "6C3E6C": "Intel", "6C4B90": "Intel", "6C60EB": "Intel", "6C6A8E": "Intel",
  "6C71D2": "Intel", "6CF37F": "Intel", "7018A3": "Intel", "701CE7": "Intel",
  "702084": "Intel", "702868": "Intel", "7041B7": "Intel", "706655": "Intel",
  "706D15": "Intel", "70720C": "Intel", "70723C": "Intel", "708544": "Intel",
  "7085C2": "Intel", "708CB6": "Intel", "70A213": "Intel", "70B3D5": "Intel",
  "70B5E8": "Intel", "70B8F6": "Intel", "70CD60": "Intel", "70DB98": "Intel",
  "70E56E": "Intel", "70EF00": "Intel", "70F11D": "Intel", "70F1A1": "Intel",
  "70F927": "Intel", "742B2F": "Intel", "742DBC": "Intel", "7438B7": "Intel",
  "744BA5": "Intel", "7451BA": "Intel", "748E08": "Intel", "74E24C": "Intel",
  "74E543": "Intel", "74EA3A": "Intel", "74E88A": "Intel", "74E9FB": "Intel",
  "74F07D": "Intel", "78028C": "Intel", "7802F7": "Intel", "783E53": "Intel",
  "784561": "Intel", "784F43": "Intel", "78541C": "Intel", "78595E": "Intel",
  "78597F": "Intel", "785C28": "Intel", "78617C": "Intel", "7867D7": "Intel",
  "786A89": "Intel", "78725D": "Intel", "7884EE": "Intel",
  "78912C": "Intel", "78964A": "Intel", "7898B1": "Intel", "789FBA": "Intel",
  "78A3E4": "Intel", "78A4C5": "Intel", "78AB60": "Intel", "78ACC0": "Intel",
  "78D004": "Intel", "78D38F": "Intel", "78DB2F": "Intel", "78DD08": "Intel",
  "78DD76": "Intel", "78EA9A": "Intel", "78EB39": "Intel", "78ED08": "Intel",
  "78F11C": "Intel", "78F5FD": "Intel", "78FE3D": "Intel",
  "7C10C9": "Intel", "7C1C68": "Intel", "7C2A31": "Intel", "7C2F66": "Intel",
  "7C3400": "Intel", "7C41A2": "Intel", "7C4B78": "Intel", "7C5CF8": "Intel",
  "7C5CFC": "Intel", "7C6193": "Intel", "7C67A2": "Intel", "7C6AEB": "Intel",
  "7C6C3F": "Intel", "7C6C8D": "Intel", "7C6D62": "Intel", "7C6F13": "Intel",
  "7C70BC": "Intel", "7C738B": "Intel", "7C7635": "Intel", "7C787E": "Intel",
  "7C7B8B": "Intel", "7C7B1C": "Intel", "7C7C26": "Intel", "7C7E5D": "Intel",
  "7C8334": "Intel", "7C8460": "Intel", "7C86C6": "Intel", "7C886A": "Intel",
  "7CA97D": "Intel", "7CAA8F": "Intel", "7CAB45": "Intel", "7CACB2": "Intel",
  "7CB21C": "Intel", "7CB59B": "Intel", "7CB733": "Intel", "7CB77F": "Intel",
  "7CB8E6": "Intel", "7CBB8A": "Intel", "7CBC86": "Intel", "7CD11E": "Intel",
  "7CD193": "Intel", "7CD30A": "Intel", "7CD864": "Intel", "7CEDB6": "Intel",
  "7CF05E": "Intel", "7CF077": "Intel", "7CF429": "Intel", "7CF854": "Intel",
  "7CFADF": "Intel", "7CFB49": "Intel",
  "80006E": "Intel", "802AA8": "Intel", "803049": "Intel", "8038BC": "Intel",
  "804971": "Intel", "804E81": "Intel", "8056F2": "Intel", "80615F": "Intel",
  "80647A": "Intel", "806C1B": "Intel", "806D57": "Intel", "80711F": "Intel",
  "80739F": "Intel", "807407": "Intel", "807ABF": "Intel", "807D3A": "Intel",
  "807E93": "Intel", "80831A": "Intel", "80858D": "Intel", "8086F2": "Intel",
  "808917": "Intel", "808C97": "Intel", "808E76": "Intel", "80904C": "Intel",
  "809133": "Intel", "80946C": "Intel", "80954F": "Intel", "8096BA": "Intel",
  "809733": "Intel", "809B4E": "Intel", "809CED": "Intel", "80A03F": "Intel",
  "80A1CC": "Intel", "80A235": "Intel", "80A4C7": "Intel", "80A85C": "Intel",
  "80AD16": "Intel", "80AE77": "Intel", "80B219": "Intel", "80B234": "Intel",
  "80B32C": "Intel", "80B575": "Intel", "80B709": "Intel", "80B947": "Intel",
  "80BAAC": "Intel", "80BBE4": "Intel", "80BC0C": "Intel", "80BD32": "Intel",
  "80C16E": "Intel", "80C5EC": "Intel", "80C844": "Intel", "80CE62": "Intel",
  "80D044": "Intel", "80D074": "Intel", "80D09D": "Intel", "80D26E": "Intel",
  "80D435": "Intel", "80D635": "Intel", "80D85E": "Intel", "80DB17": "Intel",
  "80DC32": "Intel", "80DECC": "Intel", "80DF2F": "Intel", "80E01D": "Intel",
  "80E4DA": "Intel", "80E542": "Intel", "80E86F": "Intel", "80EA96": "Intel",
  "80EB77": "Intel", "80ECF6": "Intel", "80ED2C": "Intel", "80EE25": "Intel",
  "80EF42": "Intel", "80F1F1": "Intel", "80F32F": "Intel", "80F503": "Intel",
  "80F593": "Intel", "80F827": "Intel", "80FA4C": "Intel", "80FB06": "Intel",
  "80FB41": "Intel", "80FC12": "Intel", "80FDE4": "Intel", "80FF3B": "Intel",
  "841196": "Intel", "84152F": "Intel", "841609": "Intel", "84253F": "Intel",
  "002481": "Juniper", "002688": "Juniper", "0030A6": "Juniper", "009069": "Juniper",
  "00AA00": "Juniper", "00AC72": "Juniper", "00E0DC": "Juniper", "042728": "Juniper",
  "0881F4": "Juniper", "0C8610": "Juniper", "0CC47A": "Juniper", "100E7E": "Juniper",
  "10184E": "Juniper", "18C042": "Juniper", "2047ED": "Juniper",
  "24A43C": "Juniper", "288A1C": "Juniper", "2C6BF5": "Juniper", "30392B": "Juniper",
  "34C0F5": "Juniper", "380197": "Juniper", "3C6104": "Juniper", "406C8F": "Juniper",
  "44D437": "Juniper", "481D70": "Juniper", "487624": "Juniper", "4C9614": "Juniper",
  "50465D": "Juniper", "50546A": "Juniper", "505527": "Juniper", "5076A6": "Juniper",
  "541E56": "Juniper", "54E061": "Juniper", "5800BB": "Juniper", "5C4527": "Juniper",
  "5CC9D1": "Juniper", "5CE8B7": "Juniper", "602D10": "Juniper", "608D3E": "Juniper",
  "643F5F": "Juniper", "648788": "Juniper", "64C3D6": "Juniper", "68E86A": "Juniper",
  "6C195E": "Juniper", "708556": "Juniper", "7483EF": "Juniper",
  "84124E": "Juniper", "84B59C": "Juniper", "88E0F3": "Juniper",
  "8CC7AA": "Juniper", "90CF15": "Juniper", "949B2C": "Juniper",
  "9CCC83": "Juniper", "A041A7": "Juniper", "A0D3C1": "Juniper", "A41437": "Juniper",
  "A8D0E5": "Juniper", "AC1F6B": "Juniper", "B0987C": "Juniper", "B0A839": "Juniper",
  "B0C554": "Juniper", "B0C745": "Juniper", "B40C31": "Juniper", "B41489": "Juniper",
  "B4B0AB": "Juniper", "B8144E": "Juniper", "B8782E": "Juniper", "B8AC6F": "Juniper",
  "BC0540": "Juniper", "BC1485": "Juniper", "BC2228": "Juniper", "BC4CA0": "Juniper",
  "BCE265": "Juniper", "C02700": "Juniper", "C0335E": "Juniper", "C07009": "Juniper",
  "C0835E": "Juniper", "C0A263": "Juniper", "C0B47D": "Juniper", "C4017C": "Juniper",
  "C40528": "Juniper", "C46413": "Juniper", "C47D4F": "Juniper", "C4824E": "Juniper",
  "C4A81D": "Juniper", "C4B301": "Juniper", "C4E173": "Juniper", "C80E93": "Juniper",
  "C819F7": "Juniper", "C81FEA": "Juniper", "C83B45": "Juniper", "C86C1E": "Juniper",
  "CC1247": "Juniper", "CCE17F": "Juniper", "CCE798": "Juniper", "CCF84C": "Juniper",
  "D073D5": "Juniper", "D0B5C2": "Juniper", "D0C730": "Juniper", "D404FF": "Juniper",
  "D45D64": "Juniper", "D46AA8": "Juniper", "D47856": "Juniper", "D48890": "Juniper",
  "D4C94B": "Juniper", "D830A2": "Juniper", "D850E6": "Juniper", "D89760": "Juniper",
  "D8B12E": "Juniper", "DC38E1": "Juniper", "DC4546": "Juniper", "DC46F0": "Juniper",
  "DCE1AD": "Juniper", "E00C7F": "Juniper", "E02F46": "Juniper", "E05247": "Juniper",
  "E0720A": "Juniper", "E0A724": "Juniper", "E0E631": "Juniper",
  "E41D2D": "Juniper", "E43147": "Juniper", "E4387C": "Juniper", "E44246": "Juniper",
  "E44CC4": "Juniper", "E4509A": "Juniper", "E45751": "Juniper", "E45D51": "Juniper",
  "E4710B": "Juniper", "E4776B": "Juniper", "E47898": "Juniper", "E47C8B": "Juniper",
  "E48326": "Juniper", "E48D8C": "Juniper", "E492FB": "Juniper", "E496AE": "Juniper",
  "E4970B": "Juniper", "E498D1": "Juniper", "E49C89": "Juniper", "E49F1A": "Juniper",
  "E4A32F": "Juniper", "E4A435": "Juniper", "E4A7A9": "Juniper", "E4AB43": "Juniper",
  "E4ADA4": "Juniper", "E4B005": "Juniper", "E4B324": "Juniper", "E4B97A": "Juniper",
  "E4BD7B": "Juniper", "E4C146": "Juniper", "E4C2D0": "Juniper", "E4C63B": "Juniper",
  "E4C722": "Juniper", "E4CC6C": "Juniper", "E4D323": "Juniper", "E4D332": "Juniper",
  "E4D3AA": "Juniper", "E4D882": "Juniper", "E4D9B3": "Juniper", "E4DB5D": "Juniper",
  "E4DC5F": "Juniper", "E4E0C5": "Juniper", "E4E41E": "Juniper", "E4E5EF": "Juniper",
  "E4E749": "Juniper", "E4EA83": "Juniper", "E4EDFB": "Juniper", "E4F05A": "Juniper",
  "E4F078": "Juniper", "E4F3F5": "Juniper", "E4F7D7": "Juniper",
  "E4FA3B": "Juniper", "E4FAC4": "Juniper", "E4FD4B": "Juniper",
  "000585": "Google", "001A11": "Google", "001CF0": "Google", "002268": "Google",
  "002590": "Google", "002637": "Google", "0401C1": "Google", "042D3F": "Google",
  "0827CE": "Google", "086819": "Google", "089E08": "Google", "10683F": "Google",
  "1435B7": "Google", "14A785": "Google", "18B430": "Google", "20DFB9": "Google",
  "240AC4": "Google", "286C07": "Google", "2C5491": "Google", "30FD38": "Google",
  "342EB6": "Google", "34AA8B": "Google", "38F73D": "Google", "3C5AB4": "Google",
  "40B034": "Google", "40FE0D": "Google", "44070B": "Google", "442319": "Google",
  "44783E": "Google", "44B233": "Google", "44D9E7": "Google", "48D6D5": "Google",
  "48F17F": "Google", "502A7E": "Google", "504A6F": "Google", "50642B": "Google",
  "50C2ED": "Google", "50E542": "Google", "50EB71": "Google",
  "50F520": "Google", "54147A": "Google", "542C1D": "Google", "546009": "Google",
  "54880E": "Google", "549FC5": "Google", "54AE5B": "Google", "54B80A": "Google",
  "58285A": "Google", "58A2B5": "Google", "58C7AC": "Google", "58F102": "Google",
  "5C16C7": "Google", "5CAAFD": "Google", "5CB395": "Google", "5CCF7F": "Google",
  "600308": "Google", "60601F": "Google", "606BB3": "Google",
  "60F494": "Google", "60FB42": "Google", "641666": "Google", "64168F": "Google",
  "645601": "Google",
  "DC6A63": "Raspberry Pi", "B827EB": "Raspberry Pi",
  "00163E": "Xen", "001C42": "Parallels", "080027": "VirtualBox", "525400": "QEMU/KVM",
  "0042AE": "Alibaba Cloud",
};

function normalizeMac(mac: string): string {
  const clean = mac.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
  if (clean.length < 12) return "";
  return `${clean.substring(0,2)}:${clean.substring(2,4)}:${clean.substring(4,6)}:${clean.substring(6,8)}:${clean.substring(8,10)}:${clean.substring(10,12)}`;
}

function normalizeKey(mac: string): string {
  return mac.replace(/[^0-9a-fA-F]/g, "").toUpperCase().substring(0, 6);
}

export function MacAddressLookup() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ mac: string; vendor: string; prefix: string } | null>(null);
  const [partialMatches, setPartialMatches] = useState<{ prefix: string; vendor: string }[]>([]);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const lookup = () => {
    setError("");
    setResult(null);
    setPartialMatches([]);

    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a MAC address");
      return;
    }

    const normalized = normalizeMac(trimmed);
    if (!normalized) {
      setError("Invalid MAC address format. Use formats like 00:1A:2B:3C:4D:5E or 00-1A-2B-3C-4D-5E");
      return;
    }

    const key = normalizeKey(trimmed);
    const exactMatch = OUI_DB[key];

    if (exactMatch) {
      setResult({ mac: normalized, vendor: exactMatch, prefix: key });
    } else {
      const prefix4 = key.substring(0, 4);
      const matches: { prefix: string; vendor: string }[] = [];
      const seen = new Set<string>();
      for (const [k, v] of Object.entries(OUI_DB)) {
        if (k.substring(0, 4) === prefix4 && !seen.has(v)) {
          matches.push({ prefix: k, vendor: v });
          seen.add(v);
          if (matches.length >= 10) break;
        }
      }

      setPartialMatches(matches);
      if (matches.length === 0) {
        setError("No matching vendor found for this MAC address prefix");
      }
    }
  };

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopyFeedback("Copied");
    setTimeout(() => setCopyFeedback(""), 2000);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <label className="block text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">MAC Address</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && lookup()}
            placeholder="00:1A:2B:3C:4D:5E"
            className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted"
          />
          <button onClick={lookup} className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Lookup</button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">{error}</div>
      )}

      {result && (
        <div
          className="relative group rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 dark:border-dark-border dark:bg-dark-surface cursor-pointer"
          onClick={() => copyValue(result.vendor)}
        >
          <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-1">MAC Address</span>
          <span className="block text-sm font-mono text-surface-900 dark:text-dark-text mb-2">{result.mac}</span>
          <span className="block text-[10px] uppercase tracking-wider text-surface-400 dark:text-dark-muted mb-1">Vendor / Manufacturer</span>
          <span className="block text-lg font-semibold text-brand-600 dark:text-brand-400">{result.vendor}</span>
          <span className="block text-[10px] text-surface-400 dark:text-dark-muted mt-1">OUI Prefix: {result.prefix}</span>
          <span className="absolute top-2 right-2 text-[9px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
        </div>
      )}

      {partialMatches.length > 0 && (
        <div>
          <span className="text-xs font-medium text-surface-500 dark:text-dark-muted">Possible Vendors (partial match)</span>
          <div className="mt-1 space-y-1 max-h-48 overflow-y-auto">
            {partialMatches.map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface cursor-pointer"
                onClick={() => copyValue(m.vendor)}
              >
                <span className="text-xs font-mono text-surface-600 dark:text-dark-muted">{m.prefix}</span>
                <span className="text-xs font-medium text-surface-900 dark:text-dark-text">{m.vendor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {copyFeedback && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-lg animate-fade-in">{copyFeedback}</div>
      )}
    </div>
  );
}
