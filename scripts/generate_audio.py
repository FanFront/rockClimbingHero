import wave, math, random, struct
from pathlib import Path
random.seed(19)
rate=22050
for name,duration in [('camp',12),('confirm',.16),('saved',.6),('arrival',1.2)]:
 samples=[]; noise=0
 for i in range(int(rate*duration)):
  t=i/rate
  if name=='camp':
   noise=.96*noise+.04*random.uniform(-1,1)
   envelope=math.sin(math.pi*t/duration)**2
   v=envelope*(noise*.20+math.sin(2*math.pi*110*t)*.009)
  else:
   notes={'confirm':[660], 'saved':[440,554.37,659.25], 'arrival':[329.63,440,554.37,659.25]}[name]
   step=duration/len(notes); n=min(len(notes)-1,int(t/step)); local=t-n*step
   v=.13*math.exp(-local*12)*math.sin(math.pi*min(1,local/.008)/2)*math.sin(2*math.pi*notes[n]*t)
  samples.append(struct.pack('<h',int(max(-1,min(1,v))*32767)))
 with wave.open(str(Path('assets/audio')/(name+'.wav')),'wb') as f:
  f.setparams((1,2,rate,0,'NONE','not compressed')); f.writeframes(b''.join(samples))
