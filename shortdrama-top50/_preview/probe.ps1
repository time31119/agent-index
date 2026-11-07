$targets = @(
  @{ b='ReelShort';   u=@('https://www.reelshort.com') },
  @{ b='DramaBox';    u=@('https://www.dramabox.com','https://dramabox.com','https://drama-box.com','https://dramabox.app') },
  @{ b='DramaWave';   u=@('https://www.dramawave.com','https://dramawave.com','https://drama-wave.com') },
  @{ b='NetShort';    u=@('https://www.netshort.com','https://netshort.com','https://net-short.com') },
  @{ b='FreeReels';   u=@('https://www.freereels.com','https://freereels.com','https://freereels.app') },
  @{ b='ShortMax';    u=@('https://www.shortmax.com','https://shortmax.com','https://shortmax.tv') },
  @{ b='PineDrama';   u=@('https://www.pinedrama.com','https://pinedrama.com','https://pine-drama.com') },
  @{ b='GoodShort';   u=@('https://www.goodshort.com','https://goodshort.com') },
  @{ b='BlinkDrama';  u=@('https://www.blinkdrama.com','https://blinkdrama.com','https://blink-drama.com') },
  @{ b='StoryReel';   u=@('https://www.storyreel.com','https://storyreel.com') },
  @{ b='VibeShort';   u=@('https://www.vibeshort.com','https://vibeshort.com') },
  @{ b='FlickReels';  u=@('https://www.flickreels.com','https://flickreels.com') },
  @{ b='Melolo';      u=@('https://www.melolo.com','https://melolo.com','https://melolo.app') },
  @{ b='JoyReels';    u=@('https://www.joyreels.com','https://joyreels.com') },
  @{ b='MoboReels';   u=@('https://www.moboreels.com','https://moboreels.com') },
  @{ b='StardustTV';  u=@('https://www.stardusttv.com','https://stardusttv.com','https://stardust.tv') },
  @{ b='iDrama';      u=@('https://www.idrama.com','https://idrama.com','https://i-drama.com') },
  @{ b='My Drama';    u=@('https://www.mydrama.com','https://mydrama.com','https://my-drama.com') },
  @{ b='Kuku TV';     u=@('https://www.kukutv.com','https://kukutv.com','https://kukutv.in') },
  @{ b='Story TV';    u=@('https://www.storytv.com','https://storytv.com','https://storytv.in') },
  @{ b='FreeDrama';   u=@('https://www.freedrama.com','https://freedrama.com') },
  @{ b='QuickTV';     u=@('https://www.quicktv.com','https://quicktv.com','https://quicktv.in') },
  @{ b='HotMiniDrama';u=@('https://www.hotminidrama.com','https://hotminidrama.com') },
  @{ b='Halo Reels';  u=@('https://www.haloreels.com','https://haloreels.com') },
  @{ b='CandyJarTV';  u=@('https://www.candyjartv.com','https://candyjartv.com','https://candyjar.tv') },
  @{ b='Vigloo';      u=@('https://www.vigloo.com','https://vigloo.com') },
  @{ b='Shortical';   u=@('https://www.shortical.com','https://shortical.com') },
  @{ b='Pocket FM';   u=@('https://www.pocketfm.com','https://pocketfm.com','https://pocketfm.in') },
  @{ b='KalosTV';     u=@('https://www.kalostv.com','https://kalostv.com') },
  @{ b='HotDrama';    u=@('https://www.hotdrama.com','https://hotdrama.com') },
  @{ b='Shorts';      u=@('https://www.shorts.com','https://shorts.com') },
  @{ b='Playlet';     u=@('https://www.playlet.com','https://playlet.com','https://playlet.app') },
  @{ b='ShortsWave';  u=@('https://www.shortswave.com','https://shortswave.com') },
  @{ b='MoreShort';   u=@('https://www.moreshort.com','https://moreshort.com') },
  @{ b='My Muse';     u=@('https://www.mymuse.com','https://mymuse.com') },
  @{ b='ReelyGo';     u=@('https://www.reelygo.com','https://reelygo.com') },
  @{ b='MoboDrama';   u=@('https://www.mobodrama.com','https://mobodrama.com') },
  @{ b='BibiShort';   u=@('https://www.bibishort.com','https://bibishort.com') },
  @{ b='DramaShorts'; u=@('https://www.dramashorts.com','https://dramashorts.com') },
  @{ b='ToonShort';   u=@('https://www.toonshort.com','https://toonshort.com') },
  @{ b='Soda TV';     u=@('https://www.sodatv.com','https://sodatv.com') },
  @{ b='FlexTV';      u=@('https://www.flextv.com','https://flextv.com') },
  @{ b='PopoVibe';    u=@('https://www.popovibe.com','https://popovibe.com') },
  @{ b='MangoTV';     u=@('https://www.mgtv.com','https://www.mangotv.com') },
  @{ b='FlareFlow';   u=@('https://www.flareflow.com','https://flareflow.com') },
  @{ b='DramaBox Lite'; u=@('https://www.dramabox.com') },
  @{ b='StarShort';   u=@('https://www.starshort.com','https://starshort.com') },
  @{ b='SarosTV';     u=@('https://www.sarostv.com','https://sarostv.com') },
  @{ b='LoveShots';   u=@('https://www.loveshots.com','https://loveshots.com') },
  @{ b='Felveria';    u=@('https://www.felveria.com','https://felveria.com') }
)

$out = "C:\Users\Administrator\Documents\deepseek-harness\default-workspace\shortdrama-top50\_preview\probe.csv"

$results = $targets | ForEach-Object -Parallel {
  $brand = $_.b
  $first = $null
  foreach ($u in $_.u) {
    try {
      $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 12 -MaximumRedirection 5 -Headers @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36' }
      $t = ''
      if ($r.Content -match '(?is)<title[^>]*>(.*?)</title>') { $t = ($matches[1] -replace '\s+', ' ').Trim() }
      $first = [pscustomobject]@{
        brand = $brand; tried = $u; final = $r.BaseResponse.ResponseUri.AbsoluteUri
        status = $r.StatusCode; title = $t.Substring(0, [Math]::Min(90, $t.Length))
      }
      break
    } catch {
      $msg = $_.Exception.Message -replace '\s+', ' '
      $first = [pscustomobject]@{ brand = $brand; tried = $u; final = ''; status = 'ERR'; title = $msg.Substring(0, [Math]::Min(70, $msg.Length)) }
    }
  }
  $first
} -ThrottleLimit 12

$results | Sort-Object brand | Export-Csv -Path $out -NoTypeInformation -Encoding UTF8
"rows: " + $results.Count
