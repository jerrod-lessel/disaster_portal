def is_in_california(lat, lon):
    """Returns True if the given latitude & longitude are within California boundaries."""
    if 32.5343 <= lat <= 42.0095 and -124.4096 <= lon <= -114.1312:
        return True
    return False
