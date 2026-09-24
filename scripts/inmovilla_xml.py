#!/usr/bin/env python3
"""Descarga el XML diario de Inmovilla y genera propiedades.json para la web.

Solo se copian los campos que la web necesita (nunca el XML completo), para
no publicar datos internos que pudiera traer el fichero.

Uso: INMOVILLA_XML_URL=... python3 scripts/inmovilla_xml.py
"""
import json
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET

URL = os.environ.get('INMOVILLA_XML_URL', '').strip()
SALIDA = os.environ.get('SALIDA', 'propiedades.json')
MAX_FOTOS = 6


def texto(p, campo):
    return (p.findtext(campo) or '').strip()


def numero(p, campo):
    try:
        return float(texto(p, campo).replace(',', '.') or 0)
    except ValueError:
        return 0.0


def entero(p, campo):
    return int(round(numero(p, campo)))


def convertir(p):
    accion = texto(p, 'accion')
    venta = numero(p, 'precioinmo')
    alquiler = numero(p, 'precioalq')
    es_alquiler = 'alquil' in accion.lower() and not venta
    fotos = [texto(p, f'foto{i}') for i in range(1, 40)]
    fotos = [f for f in fotos if f.startswith('http')][:MAX_FOTOS]
    tipo = texto(p, 'tipo_ofer')
    zona = texto(p, 'zona')
    ciudad = texto(p, 'ciudad')
    titulo = texto(p, 'titulo1') or ' en '.join(x for x in [tipo, zona or ciudad] if x)
    descripcion = texto(p, 'descrip1').replace('~', '\n')
    return {
        'ref': texto(p, 'ref'),
        'titulo': titulo,
        'tipo': tipo,
        'operacion': 'Alquiler' if es_alquiler else ('Venta' if 'vend' in accion.lower() else accion or 'Venta'),
        'precio': int(round(alquiler if es_alquiler else venta)) or None,
        'precioAlquiler': (int(round(alquiler)) or None) if not es_alquiler else None,
        'zona': ', '.join(x for x in [zona, ciudad] if x),
        'dormitorios': entero(p, 'habitaciones') + entero(p, 'habdobles') or None,
        'banos': entero(p, 'banyos') + entero(p, 'aseos') or None,
        'm2': entero(p, 'm_cons') or None,
        'parcela': entero(p, 'm_parcela') or None,
        'cee': texto(p, 'energialetra').upper() or 'En trámite',
        'destacado': texto(p, 'destacado') == '1',
        'fotos': fotos,
        'descripcion': descripcion[:600],
    }


def main():
    if not URL:
        sys.exit('Falta la variable INMOVILLA_XML_URL')
    with urllib.request.urlopen(URL, timeout=120) as r:
        raiz = ET.fromstring(r.read())
    props = [convertir(p) for p in raiz.findall('propiedad')]
    props = [p for p in props if p['ref']]
    props.sort(key=lambda p: (not p['destacado'], -(p['precio'] or 0)))
    with open(SALIDA, 'w', encoding='utf-8') as f:
        json.dump(props, f, ensure_ascii=False, indent=1)
    print(f'{len(props)} propiedades escritas en {SALIDA}')
    for p in props[:5]:
        print(' -', p['ref'], p['operacion'], p['precio'], p['zona'], p['cee'], len(p['fotos']), 'fotos')


if __name__ == '__main__':
    main()
