#!/usr/bin/python
# coding: utf-8

__author__ = 'Akitoshi Abe <abe@baytech.co.jp>'

import os
import webapp2
import logging
import json
from google.appengine.api import users
from google.appengine.api import namespace_manager
from google.appengine.api import taskqueue
from google.appengine.api.urlfetch import DownloadError
from google.appengine.ext.db.metadata import Namespace
from google.appengine.api import search
from ucf.utils.models import *
import sateraito_inc
import sateraito_func
import sateraito_db
from ucf.utils.ucfutil import UcfUtil
import lineworks_func

'''
data_cleansing2.py

@since: 2013-10-23
@version: 2013-10-23
@author: Akitoshi Abe
'''


KICKER_EMAIL = 'asao@baytech.co.jp'

class _DataCleansing(webapp2.RequestHandler):

	def _process(self):
		tp = self.request.get('tp')
		# WORKSMOBILE依頼：1メッセージ×１０００回、チャット送信検証
		if tp == 'examin_sendchatmessages':
			self._examin_sendchatmessages()
		else:
			pass
		return

	# WORKSMOBILE依頼：1メッセージ×１０００回、チャット送信検証
	def _examin_sendchatmessages(self):

		bot_no = 618
		open_api_id = 'jp1GPLbtLBXLv'
		consumer_key = 'TGaDiU2ZZBdcGlT2NTgx'
		server_id = '2f99eef6fb504369b6dd9ae217947aef'
		priv_key = '''-----BEGIN RSA PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCzRXg7CoKgPwk3
0/oC3n/QU3LggStfPvLsocejAKBwU08bIrUJ4+J61ZvGs8B6QODVqcEWKuFNTh0V
PQRjEsIlAn8ubIjGnd8YZ+3dDAM0Y1KHRK5sSddEDrHY4cUQzfCxiQuFBmofqGxr
R94kOU71yz6SsNFAh9g1Wmy2K2vjqvdHzc4rtDilExWGQD8P5QGuSxlSxSjrlxCX
OwhvxEFoasqh5qNchIioDWtIhCrV3Cf6le03/vdhuxXfEtYO++o2+hqHq9EidYv2
u3dJ7RznQ8bpS7pvg5GbncGXjND03OMylDAW21ovjBsl94ffO2g9ryCCGfiVUmS6
H/Lt4F1FAgMBAAECggEAet3xEl4YuyWY9sd1AcRnS2v2PwKorEXjjuUug3xpebLP
c+SsudOTJOcENgJ6uA+BSU9oQ/4tnqMb8bN5L0HrCByW+EVw1Nfc0MhiUW7rP1uX
c5hSB2vweverUt8iBmtvPO6Vk52a3Im9jSWbja4tfO7Iuxcuw5CXUbHg8lX+QvGD
ayn1dU4u7Pn0YZTm9wVrjTxCgGCAZnvVpIlI6VscskWGSIW3IW5PbhY8Y7Cb3W3L
i09vhxu0hKxcglLBFTdo6n4wFeqQMV6IX5hWuCxZs0RVc/aRFUdIkjdNAq+lyuJY
Mno6wYWdObkbJ1Q3VASK6pETs5F2b5MoJzVa0AmnPQKBgQDdallRea9ByM4VzbFR
e0idziqek6SATuC0fRlns/Qwm5GlwUSWWRR3P6Sf1hMcg9cF6uG2Ds5xNv8N01eS
iBceJLtI+cJkdO0kCBbYAkoO9Rq52QkL8B+2ruh8E0sJYf+te1YFYcKn9D+gH8bf
fbBxsYYKH6RhNc/qXqahgLtVqwKBgQDPRexDHOKc2U/tppkO99F0OSzmZKwfzzx3
ST42qI9fFcDyaipO8u98Dvh2Zqe/+15Igkd13klkiFkMhBWRh3MQmfbyIau44RXi
OTirBIatiXwmX3QbSHCmtDGNKH4q7xuuNTVk5N3isoor7OfJgqPV7Grv0ZuuLRnN
5xs4iOpIzwKBgQCS6AwJJf6lXDF4f/iFgpHkujTG8Fj2FN+8gUBI8To0whN58eir
BMGyeVSmBGi7w7H4KCbIH7zTm1TQ/IefHpKQGnj061oSQw5QmNlnSuWOVQv9gUYi
WJkCIbz5Def8erwkg6/IdFuuCj3o5QyTnpZiaRHxR5tOMGEaNODESWCCbwKBgQCF
//2DUexLXM6opHj1TU+TJNebR2Bj3DWKJMbczVKLNWQdFHevvK0I9iC5Yxp2KktE
8zzBveiS3vc6+TV8dSX1iKQ223/KMXJVY4r4PR/Ylza1FCba8JUroPkb+h6/IQAz
OuD/DltIkQZ06V7cTuIejg6AZnGQREYXcJ6PiSx1zwKBgQC7721PAs7wcc4FqEi9
CvTP+ouiOGgUn7vkEuyQgDj1kHhEmFqXPkY68kUpEBTlNsiJ1ldCVTYpGVb7Qfzn
/rwui9hBmpn4wORxDN8UAHfXJIYXc/d6j/iP9wkfXhjwbjGsjU7iD4W4iW+/KiOm
OBhhCgHIYu+QgQgiZceyX28Hnw==
-----END RSA PRIVATE KEY-----
'''

		to_list = [

			'desktop_001@wdomain11.com',
			'desktop_002@wdomain11.com',
			'desktop_003@wdomain11.com',
			'desktop_004@wdomain11.com',
			'desktop_005@wdomain11.com',
			'desktop_006@wdomain11.com',
			'desktop_007@wdomain11.com',
			'desktop_008@wdomain11.com',
			'desktop_009@wdomain11.com',
			'desktop_010@wdomain11.com',
			'desktop_011@wdomain11.com',
			'desktop_012@wdomain11.com',
			'desktop_013@wdomain11.com',
			'desktop_014@wdomain11.com',
			'desktop_015@wdomain11.com',
			'desktop_016@wdomain11.com',
			'desktop_017@wdomain11.com',
			'desktop_018@wdomain11.com',
			'desktop_019@wdomain11.com',
			'desktop_020@wdomain11.com',
			'desktop_021@wdomain11.com',
			'desktop_022@wdomain11.com',
			'desktop_023@wdomain11.com',
			'desktop_024@wdomain11.com',
			'desktop_025@wdomain11.com',
			'desktop_026@wdomain11.com',
			'desktop_027@wdomain11.com',
			'desktop_028@wdomain11.com',
			'desktop_029@wdomain11.com',
			'desktop_030@wdomain11.com',
			'desktop_031@wdomain11.com',
			'desktop_032@wdomain11.com',
			'desktop_033@wdomain11.com',
			'desktop_034@wdomain11.com',
			'desktop_035@wdomain11.com',
			'desktop_036@wdomain11.com',
			'desktop_037@wdomain11.com',
			'desktop_038@wdomain11.com',
			'desktop_039@wdomain11.com',
			'desktop_040@wdomain11.com',
			'desktop_041@wdomain11.com',
			'desktop_042@wdomain11.com',
			'desktop_043@wdomain11.com',
			'desktop_044@wdomain11.com',
			'desktop_045@wdomain11.com',
			'desktop_046@wdomain11.com',
			'desktop_047@wdomain11.com',
			'desktop_048@wdomain11.com',
			'desktop_049@wdomain11.com',
			'desktop_050@wdomain11.com',
			'desktop_051@wdomain11.com',
			'desktop_052@wdomain11.com',
			'desktop_053@wdomain11.com',
			'desktop_054@wdomain11.com',
			'desktop_055@wdomain11.com',
			'desktop_056@wdomain11.com',
			'desktop_057@wdomain11.com',
			'desktop_058@wdomain11.com',
			'desktop_059@wdomain11.com',
			'desktop_060@wdomain11.com',
			'desktop_061@wdomain11.com',
			'desktop_062@wdomain11.com',
			'desktop_063@wdomain11.com',
			'desktop_064@wdomain11.com',
			'desktop_065@wdomain11.com',
			'desktop_066@wdomain11.com',
			'desktop_067@wdomain11.com',
			'desktop_068@wdomain11.com',
			'desktop_069@wdomain11.com',
			'desktop_070@wdomain11.com',
			'desktop_071@wdomain11.com',
			'desktop_072@wdomain11.com',
			'desktop_073@wdomain11.com',
			'desktop_074@wdomain11.com',
			'desktop_075@wdomain11.com',
			'desktop_076@wdomain11.com',
			'desktop_077@wdomain11.com',
			'desktop_078@wdomain11.com',
			'desktop_079@wdomain11.com',
			'desktop_080@wdomain11.com',
			'desktop_081@wdomain11.com',
			'desktop_082@wdomain11.com',
			'desktop_083@wdomain11.com',
			'desktop_084@wdomain11.com',
			'desktop_085@wdomain11.com',
			'desktop_086@wdomain11.com',
			'desktop_087@wdomain11.com',
			'desktop_088@wdomain11.com',
			'desktop_089@wdomain11.com',
			'desktop_090@wdomain11.com',
			'desktop_091@wdomain11.com',
			'desktop_092@wdomain11.com',
			'desktop_093@wdomain11.com',
			'desktop_094@wdomain11.com',
			'desktop_095@wdomain11.com',
			'desktop_096@wdomain11.com',
			'desktop_097@wdomain11.com',
			'desktop_098@wdomain11.com',
			'desktop_099@wdomain11.com',
			'desktop_100@wdomain11.com',
			'desktop_101@wdomain11.com',
			'desktop_102@wdomain11.com',
			'desktop_103@wdomain11.com',
			'desktop_104@wdomain11.com',
			'desktop_105@wdomain11.com',
			'desktop_106@wdomain11.com',
			'desktop_107@wdomain11.com',
			'desktop_108@wdomain11.com',
			'desktop_109@wdomain11.com',
			'desktop_110@wdomain11.com',
			'desktop_111@wdomain11.com',
			'desktop_112@wdomain11.com',
			'desktop_113@wdomain11.com',
			'desktop_114@wdomain11.com',
			'desktop_115@wdomain11.com',
			'desktop_116@wdomain11.com',
			'desktop_117@wdomain11.com',
			'desktop_118@wdomain11.com',
			'desktop_119@wdomain11.com',
			'desktop_120@wdomain11.com',
			'desktop_121@wdomain11.com',
			'desktop_122@wdomain11.com',
			'desktop_123@wdomain11.com',
			'desktop_124@wdomain11.com',
			'desktop_125@wdomain11.com',
			'desktop_126@wdomain11.com',
			'desktop_127@wdomain11.com',
			'desktop_128@wdomain11.com',
			'desktop_129@wdomain11.com',
			'desktop_130@wdomain11.com',
			'desktop_131@wdomain11.com',
			'desktop_132@wdomain11.com',
			'desktop_133@wdomain11.com',
			'desktop_134@wdomain11.com',
			'desktop_135@wdomain11.com',
			'desktop_136@wdomain11.com',
			'desktop_137@wdomain11.com',
			'desktop_138@wdomain11.com',
			'desktop_139@wdomain11.com',
			'desktop_140@wdomain11.com',
			'desktop_141@wdomain11.com',
			'desktop_142@wdomain11.com',
			'desktop_143@wdomain11.com',
			'desktop_144@wdomain11.com',
			'desktop_145@wdomain11.com',
			'desktop_146@wdomain11.com',
			'desktop_147@wdomain11.com',
			'desktop_148@wdomain11.com',
			'desktop_149@wdomain11.com',
			'desktop_150@wdomain11.com',
			'desktop_151@wdomain11.com',
			'desktop_152@wdomain11.com',
			'desktop_153@wdomain11.com',
			'desktop_154@wdomain11.com',
			'desktop_155@wdomain11.com',
			'desktop_156@wdomain11.com',
			'desktop_157@wdomain11.com',
			'desktop_158@wdomain11.com',
			'desktop_159@wdomain11.com',
			'desktop_160@wdomain11.com',
			'desktop_161@wdomain11.com',
			'desktop_162@wdomain11.com',
			'desktop_163@wdomain11.com',
			'desktop_164@wdomain11.com',
			'desktop_165@wdomain11.com',
			'desktop_166@wdomain11.com',
			'desktop_167@wdomain11.com',
			'desktop_168@wdomain11.com',
			'desktop_169@wdomain11.com',
			'desktop_170@wdomain11.com',
			'desktop_171@wdomain11.com',
			'desktop_172@wdomain11.com',
			'desktop_173@wdomain11.com',
			'desktop_174@wdomain11.com',
			'desktop_175@wdomain11.com',
			'desktop_176@wdomain11.com',
			'desktop_177@wdomain11.com',
			'desktop_178@wdomain11.com',
			'desktop_179@wdomain11.com',
			'desktop_180@wdomain11.com',
			'desktop_181@wdomain11.com',
			'desktop_182@wdomain11.com',
			'desktop_183@wdomain11.com',
			'desktop_184@wdomain11.com',
			'desktop_185@wdomain11.com',
			'desktop_186@wdomain11.com',
			'desktop_187@wdomain11.com',
			'desktop_188@wdomain11.com',
			'desktop_189@wdomain11.com',
			'desktop_190@wdomain11.com',
			'desktop_191@wdomain11.com',
			'desktop_192@wdomain11.com',
			'desktop_193@wdomain11.com',
			'desktop_194@wdomain11.com',
			'desktop_195@wdomain11.com',
			'desktop_196@wdomain11.com',
			'desktop_197@wdomain11.com',
			'desktop_198@wdomain11.com',
			'desktop_199@wdomain11.com',
			'desktop_200@wdomain11.com',
			'desktop_201@wdomain11.com',
			'desktop_202@wdomain11.com',
			'desktop_203@wdomain11.com',
			'desktop_204@wdomain11.com',
			'desktop_205@wdomain11.com',
			'desktop_206@wdomain11.com',
			'desktop_207@wdomain11.com',
			'desktop_208@wdomain11.com',
			'desktop_209@wdomain11.com',
			'desktop_210@wdomain11.com',
			'desktop_211@wdomain11.com',
			'desktop_212@wdomain11.com',
			'desktop_213@wdomain11.com',
			'desktop_214@wdomain11.com',
			'desktop_215@wdomain11.com',
			'desktop_216@wdomain11.com',
			'desktop_217@wdomain11.com',
			'desktop_218@wdomain11.com',
			'desktop_219@wdomain11.com',
			'desktop_220@wdomain11.com',
			'desktop_221@wdomain11.com',
			'desktop_222@wdomain11.com',
			'desktop_223@wdomain11.com',
			'desktop_224@wdomain11.com',
			'desktop_225@wdomain11.com',
			'desktop_226@wdomain11.com',
			'desktop_227@wdomain11.com',
			'desktop_228@wdomain11.com',
			'desktop_229@wdomain11.com',
			'desktop_230@wdomain11.com',
			'desktop_231@wdomain11.com',
			'desktop_232@wdomain11.com',
			'desktop_233@wdomain11.com',
			'desktop_234@wdomain11.com',
			'desktop_235@wdomain11.com',
			'desktop_236@wdomain11.com',
			'desktop_237@wdomain11.com',
			'desktop_238@wdomain11.com',
			'desktop_239@wdomain11.com',
			'desktop_240@wdomain11.com',
			'desktop_241@wdomain11.com',
			'desktop_242@wdomain11.com',
			'desktop_243@wdomain11.com',
			'desktop_244@wdomain11.com',
			'desktop_245@wdomain11.com',
			'desktop_246@wdomain11.com',
			'desktop_247@wdomain11.com',
			'desktop_248@wdomain11.com',
			'desktop_249@wdomain11.com',
			'desktop_250@wdomain11.com',
			'desktop_251@wdomain11.com',
			'desktop_252@wdomain11.com',
			'desktop_253@wdomain11.com',
			'desktop_254@wdomain11.com',
			'desktop_255@wdomain11.com',
			'desktop_256@wdomain11.com',
			'desktop_257@wdomain11.com',
			'desktop_258@wdomain11.com',
			'desktop_259@wdomain11.com',
			'desktop_260@wdomain11.com',
			'desktop_261@wdomain11.com',
			'desktop_262@wdomain11.com',
			'desktop_263@wdomain11.com',
			'desktop_264@wdomain11.com',
			'desktop_265@wdomain11.com',
			'desktop_266@wdomain11.com',
			'desktop_267@wdomain11.com',
			'desktop_268@wdomain11.com',
			'desktop_269@wdomain11.com',
			'desktop_270@wdomain11.com',
			'desktop_271@wdomain11.com',
			'desktop_272@wdomain11.com',
			'desktop_273@wdomain11.com',
			'desktop_274@wdomain11.com',
			'desktop_275@wdomain11.com',
			'desktop_276@wdomain11.com',
			'desktop_277@wdomain11.com',
			'desktop_278@wdomain11.com',
			'desktop_279@wdomain11.com',
			'desktop_280@wdomain11.com',
			'desktop_281@wdomain11.com',
			'desktop_282@wdomain11.com',
			'desktop_283@wdomain11.com',
			'desktop_284@wdomain11.com',
			'desktop_285@wdomain11.com',
			'desktop_286@wdomain11.com',
			'desktop_287@wdomain11.com',
			'desktop_288@wdomain11.com',
			'desktop_289@wdomain11.com',
			'desktop_290@wdomain11.com',
			'desktop_291@wdomain11.com',
			'desktop_292@wdomain11.com',
			'desktop_293@wdomain11.com',
			'desktop_294@wdomain11.com',
			'desktop_295@wdomain11.com',
			'desktop_296@wdomain11.com',
			'desktop_297@wdomain11.com',
			'desktop_298@wdomain11.com',
			'desktop_299@wdomain11.com',
			'desktop_300@wdomain11.com',
			'desktop_301@wdomain11.com',
			'desktop_302@wdomain11.com',
			'desktop_303@wdomain11.com',
			'desktop_304@wdomain11.com',
			'desktop_305@wdomain11.com',
			'desktop_306@wdomain11.com',
			'desktop_307@wdomain11.com',
			'desktop_308@wdomain11.com',
			'desktop_309@wdomain11.com',
			'desktop_310@wdomain11.com',
			'desktop_311@wdomain11.com',
			'desktop_312@wdomain11.com',
			'desktop_313@wdomain11.com',
			'desktop_314@wdomain11.com',
			'desktop_315@wdomain11.com',
			'desktop_316@wdomain11.com',
			'desktop_317@wdomain11.com',
			'desktop_318@wdomain11.com',
			'desktop_319@wdomain11.com',
			'desktop_320@wdomain11.com',
			'desktop_321@wdomain11.com',
			'desktop_322@wdomain11.com',
			'desktop_323@wdomain11.com',
			'desktop_324@wdomain11.com',
			'desktop_325@wdomain11.com',
			'desktop_326@wdomain11.com',
			'desktop_327@wdomain11.com',
			'desktop_328@wdomain11.com',
			'desktop_329@wdomain11.com',
			'desktop_330@wdomain11.com',
			'desktop_331@wdomain11.com',
			'desktop_332@wdomain11.com',
			'desktop_333@wdomain11.com',
			'desktop_334@wdomain11.com',
			'desktop_335@wdomain11.com',
			'desktop_336@wdomain11.com',
			'desktop_337@wdomain11.com',
			'desktop_338@wdomain11.com',
			'desktop_339@wdomain11.com',
			'desktop_340@wdomain11.com',
			'desktop_341@wdomain11.com',
			'desktop_342@wdomain11.com',
			'desktop_343@wdomain11.com',
			'desktop_344@wdomain11.com',
			'desktop_345@wdomain11.com',
			'desktop_346@wdomain11.com',
			'desktop_347@wdomain11.com',
			'desktop_348@wdomain11.com',
			'desktop_349@wdomain11.com',
			'desktop_350@wdomain11.com',
			'desktop_351@wdomain11.com',
			'desktop_352@wdomain11.com',
			'desktop_353@wdomain11.com',
			'desktop_354@wdomain11.com',
			'desktop_355@wdomain11.com',
			'desktop_356@wdomain11.com',
			'desktop_357@wdomain11.com',
			'desktop_358@wdomain11.com',
			'desktop_359@wdomain11.com',
			'desktop_360@wdomain11.com',
			'desktop_361@wdomain11.com',
			'desktop_362@wdomain11.com',
			'desktop_363@wdomain11.com',
			'desktop_364@wdomain11.com',
			'desktop_365@wdomain11.com',
			'desktop_366@wdomain11.com',
			'desktop_367@wdomain11.com',
			'desktop_368@wdomain11.com',
			'desktop_369@wdomain11.com',
			'desktop_370@wdomain11.com',
			'desktop_371@wdomain11.com',
			'desktop_372@wdomain11.com',
			'desktop_373@wdomain11.com',
			'desktop_374@wdomain11.com',
			'desktop_375@wdomain11.com',
			'desktop_376@wdomain11.com',
			'desktop_377@wdomain11.com',
			'desktop_378@wdomain11.com',
			'desktop_379@wdomain11.com',
			'desktop_380@wdomain11.com',
			'desktop_381@wdomain11.com',
			'desktop_382@wdomain11.com',
			'desktop_383@wdomain11.com',
			'desktop_384@wdomain11.com',
			'desktop_385@wdomain11.com',
			'desktop_386@wdomain11.com',
			'desktop_387@wdomain11.com',
			'desktop_388@wdomain11.com',
			'desktop_389@wdomain11.com',
			'desktop_390@wdomain11.com',
			'desktop_391@wdomain11.com',
			'desktop_392@wdomain11.com',
			'desktop_393@wdomain11.com',
			'desktop_394@wdomain11.com',
			'desktop_395@wdomain11.com',
			'desktop_396@wdomain11.com',
			'desktop_397@wdomain11.com',
			'desktop_398@wdomain11.com',
			'desktop_399@wdomain11.com',
			'desktop_400@wdomain11.com',
			'desktop_401@wdomain11.com',
			'desktop_402@wdomain11.com',
			'desktop_403@wdomain11.com',
			'desktop_404@wdomain11.com',
			'desktop_405@wdomain11.com',
			'desktop_406@wdomain11.com',
			'desktop_407@wdomain11.com',
			'desktop_408@wdomain11.com',
			'desktop_409@wdomain11.com',
			'desktop_410@wdomain11.com',
			'desktop_411@wdomain11.com',
			'desktop_412@wdomain11.com',
			'desktop_413@wdomain11.com',
			'desktop_414@wdomain11.com',
			'desktop_415@wdomain11.com',
			'desktop_416@wdomain11.com',
			'desktop_417@wdomain11.com',
			'desktop_418@wdomain11.com',
			'desktop_419@wdomain11.com',
			'desktop_420@wdomain11.com',
			'desktop_421@wdomain11.com',
			'desktop_422@wdomain11.com',
			'desktop_423@wdomain11.com',
			'desktop_424@wdomain11.com',
			'desktop_425@wdomain11.com',
			'desktop_426@wdomain11.com',
			'desktop_427@wdomain11.com',
			'desktop_428@wdomain11.com',
			'desktop_429@wdomain11.com',
			'desktop_430@wdomain11.com',
			'desktop_431@wdomain11.com',
			'desktop_432@wdomain11.com',
			'desktop_433@wdomain11.com',
			'desktop_434@wdomain11.com',
			'desktop_435@wdomain11.com',
			'desktop_436@wdomain11.com',
			'desktop_437@wdomain11.com',
			'desktop_438@wdomain11.com',
			'desktop_439@wdomain11.com',
			'desktop_440@wdomain11.com',
			'desktop_441@wdomain11.com',
			'desktop_442@wdomain11.com',
			'desktop_443@wdomain11.com',
			'desktop_444@wdomain11.com',
			'desktop_445@wdomain11.com',
			'desktop_446@wdomain11.com',
			'desktop_447@wdomain11.com',
			'desktop_448@wdomain11.com',
			'desktop_449@wdomain11.com',
			'desktop_450@wdomain11.com',
			'desktop_451@wdomain11.com',
			'desktop_452@wdomain11.com',
			'desktop_453@wdomain11.com',
			'desktop_454@wdomain11.com',
			'desktop_455@wdomain11.com',
			'desktop_456@wdomain11.com',
			'desktop_457@wdomain11.com',
			'desktop_458@wdomain11.com',
			'desktop_459@wdomain11.com',
			'desktop_460@wdomain11.com',
			'desktop_461@wdomain11.com',
			'desktop_462@wdomain11.com',
			'desktop_463@wdomain11.com',
			'desktop_464@wdomain11.com',
			'desktop_465@wdomain11.com',
			'desktop_466@wdomain11.com',
			'desktop_467@wdomain11.com',
			'desktop_468@wdomain11.com',
			'desktop_469@wdomain11.com',
			'desktop_470@wdomain11.com',
			'desktop_471@wdomain11.com',
			'desktop_472@wdomain11.com',
			'desktop_473@wdomain11.com',
			'desktop_474@wdomain11.com',
			'desktop_475@wdomain11.com',
			'desktop_476@wdomain11.com',
			'desktop_477@wdomain11.com',
			'desktop_478@wdomain11.com',
			'desktop_479@wdomain11.com',
			'desktop_480@wdomain11.com',
			'desktop_481@wdomain11.com',
			'desktop_482@wdomain11.com',
			'desktop_483@wdomain11.com',
			'desktop_484@wdomain11.com',
			'desktop_485@wdomain11.com',
			'desktop_486@wdomain11.com',
			'desktop_487@wdomain11.com',
			'desktop_488@wdomain11.com',
			'desktop_489@wdomain11.com',
			'desktop_490@wdomain11.com',
			'desktop_491@wdomain11.com',
			'desktop_492@wdomain11.com',
			'desktop_493@wdomain11.com',
			'desktop_494@wdomain11.com',
			'desktop_495@wdomain11.com',
			'desktop_496@wdomain11.com',
			'desktop_497@wdomain11.com',
			'desktop_498@wdomain11.com',
			'desktop_499@wdomain11.com',
			'desktop_500@wdomain11.com',
			'desktop_501@wdomain11.com',
		]
		send_message = u'''これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
これはLINE WORKSチャットボットAPIのメッセージ送信処理のパフォーマンスを検証するためのテストチャットです。同じメッセージを５００ユーザーに対して2セットずつ送信します。すなわち合計１０００回送信します。
'''

		if False:
			bot_no = 583
			open_api_id = 'jp1pODnyTtwxk'
			consumer_key = 'oy3osR7z2umMkMfYRUp7'
			server_id = '9fc28d64ef3c478dbab48e3c4265d09a'
			priv_key = '''-----BEGIN RSA PRIVATE KEY-----
	MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDUMhURM/4/58+P
	3T4qdaqG3nSBwn7raZC5acp8/kpPg2+OL7OxX17XWRZwzyNeo0+bnrxnuIOOL2Gw
	QyAi12W78ZIFJbznLgotbFnaGvKu11AR92NS0FNXi/w5+UB7i9e0rf7DWeS5bbsT
	cctypzzJ+xpkq74iLtWuSfvbaJLDiQBiPucgktjKHLVou22M7Bq4y7ARnrEhOoaA
	TIHNEFl2zFt2ExLr3g2Kvn9JtYwvPo3Yrrcn4WrOpLy0aACOO0gl8u5Ua+zSDfik
	TYudXq+zJBGrjHDUDTtWPG3QYVWEQmRaP03YBhxhQ8k7JkbsufODgFSX4Xn2Kmin
	KX68rKMHAgMBAAECggEBAIIZFquOeiLKSIsG9Zdovx2jhEEOc2x4M8BKKVjLO9pW
	Vm4RtxVXyLk1qLmPdjsO278o6pCZIydoy3cbILfb4kcBzCoVwiTnKFxDIy/C9+nU
	nwX07FOY4JA7hnAw7qUQzza6uwkgs0gxC9LXIQpxmKapqrvwREmG94G9YIpcKidx
	WRU9cXyfqAQH+TmBDT9vHZ8UCNB2TEY48ojMdoWZcjzBPJvFY5mUDxxp4K81ACOn
	9adqrljFT06TLtZNmOnMwEkyu3ZPwvqXD/8oJAv644L7hFtOCkEEKGJr40mrGE8j
	m/0qYetEkqWnmRL1OzDbtadPDHWd+ejgan8VcnA+QbkCgYEA7CvtMj+tSwQsmRl2
	TeRrl0JgK6pbVIe/XBxcaZdT5YMH1D8bQHRFLJQ87ZsXPHlbpfcGdcZ2HRkNrc0F
	9VQJifpD6pbVmEgHnCnELQWbCe9m+YsfpcsbH5z7fI//vvRiyT/xFWFF4DZRcaBE
	nGGsxGfljHH5UR7ifFB0/6aqzW0CgYEA5gLWNaOxvujfAjxbzn4miHtY21J0RLx2
	u5jrqH9WCzV6F2t0Knjsr+biU9FHknG+/VFsr7uSyqRxL3N4Me39qhOHyhtP5SS0
	MELnFO231q7q4BSiwn2oFeJLhtlyNe3RH5YYU4fkgbOGHEkumn5d/H7BMfGId7Km
	qP4DKhCOLcMCgYARvLLRxUqEicm3rdveubsC3y9N2DuHu7I5fr/KBl18rTyXSi4H
	xzOyx2dUCQPTvOGPM2A+1CrmwIzwcqdx51/YBv22zqE4EKDRr6lWIEemlV5Me5Bi
	6UAePbH9husUMlKA/tZiXq3ayvmO6RR+Ei/hiFQLGjw5RXKJF5nR4XiOeQKBgCe9
	V7s+xAgC/fzJ5ua/XvL3tLt3/ISftzfkTNr43SnknGqNcy2fZO1jS7lFkEMaCfCE
	b+3Qz6TZUoDrR1oBD3GiHDTsERq7A7LO7FPuWnPqFsSObCyEP1VAmuH6kcQFibsW
	WK+d6/oIxWP/tOCWcrCcSc7SN0zO/gJ2mJ9c6uO3AoGBAL5hMz+sIkRTBQADJ89B
	LrpG8W9DwmJQIST1qYnGmTsEyvnqSAmqiAVc13hd8BmAzLnNBa8DT85aPixA2q+Q
	kgg2p2CFaALTUHG6riupElOP4hb78sCmsj4efJ5dCyVq4sDd+s9U3exXpCi/8saK
	OywvrXG1avsxM+fslNDbCsly
	-----END RSA PRIVATE KEY-----'''

			to_list = ['oka@sateraito', 'testuser-001@sateraito']

		# 入力チェック
		if bot_no <= 0 or open_api_id == '' or consumer_key == '' or server_id == '' or priv_key == '':
			logging.error('ERR_EMPTY_LINEWORKSAPIKEYS')
			return

		logging.info('start...')
		process_cnt = 0
		success_cnt = 0
		failed_cnt = 0
		for i in range(1, 3):
			for to in to_list:
				process_cnt = process_cnt + 1
				try:
					# LINE WORKS APIコール…メッセージ送信
					payload = {
						'botNo': bot_no,
						#'channelNo'			: 0,
						#'accountList'			: [to],
						'accountId'			: to,
						'type'			: 'text',
						'content'			: {'type':'text', 'text':send_message},
						#'push'			: True,
						}
					result = lineworks_func.callLineWorksAPI('/message/sendMessage', open_api_id, consumer_key, server_id, priv_key, payload, api_version='v2')
					if result.status_code != 200:
						logging.error('[process]' + str(process_cnt) + '[status_code]' + str(result.status_code))
						logging.error(result.content)
						failed_cnt += 1
					else:
						result_json = json.JSONDecoder().decode(result.content)
						if result_json.get('code', 0) != 200:
							logging.error('[process]' + str(process_cnt))
							logging.warning(result_json)
							failed_cnt += 1
						else:
							success_cnt += 1
				except Exception, e:
					logging.error('[process]' + str(process_cnt))
					logging.exception(e)
					failed_cnt += 1

				if process_cnt % 100 == 0:
					logging.info('process...(%s/%s/%s)'  % (str(process_cnt), str(success_cnt), str(failed_cnt)))
		logging.info('fin. (%s/%s/%s)'  % (str(process_cnt), str(success_cnt), str(failed_cnt)))

class DataCleansing(_DataCleansing):
	""" data cleansing
	"""
	
	def get(self):
		
		# set namespace
		user = users.get_current_user()
		if user is None:
			#logging.info('user not logged in')

			continue_param = self.request.uri
			login_url = users.create_login_url(continue_param)
			self.redirect(login_url)
			return
		if user.email() != KICKER_EMAIL:
			logging.info('wrong user')
			return
		
		self.response.out.write("""
<html>
<head>
<title>data cleansing</title>
</head>
<body>
<form method="post">
<input type="submit" value="start data cleansing">
<input type="hidden" name="process" value="b1process">
</form>
<br/>
<form method="post">
<input type="hidden" name="tp" value="examin_sendchatmessages">
<input type="submit" value="examin_sendchatmessages">
<input type="hidden" name="process" value="b2process">
</form>
</body>
</html>
""")

	def post(self):

		logging.info('start data cleansing')
		user = users.get_current_user()
		if user is None:
			logging.info('user not logged in')
			return
		if user.email() != KICKER_EMAIL:
			logging.info('wrong user')
			return
		
		tp = self.request.get('tp')
		process = self.request.get('process')

		if process == '':
			self._process()
		else:
			task_url = '/tq/datacleansing'
			#task_url = self.request.url.split('?')[0].rstrip('/') + '/tq/datacleansing'
			logging.info('task_url=' + task_url)
			# kick data cleansing batch
			que = taskqueue.Queue('default')
			task = taskqueue.Task(
					url=task_url,
					params={
						'tp':tp
						},
					target=process,
					countdown=1
			)
			que.add(task)
			self.response.out.write('data cleansing started')
		return



class TqDataCleansing(_DataCleansing):

	def post(self):
		
		logging.info('data cleansing started')

		tp = self.request.get('tp')

		self._process()
		return


app = webapp2.WSGIApplication([
							('/datacleansing$', DataCleansing),
							('/tq/datacleansing$', TqDataCleansing),
							], debug=sateraito_inc.debug_mode)
