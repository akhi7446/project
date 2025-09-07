import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Recommendation, ExternalBook } from '../models/models';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private api = `http://localhost:7000/api/Recommendation`; // ✅ Backend endpoint

  constructor(private http: HttpClient) {}

  // --- Get recommendations from your local DB ---
  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(this.api).pipe(
      catchError(err => {
        console.error('❌ Failed to fetch local recommendations:', err);
        return of([]); // return empty array instead of crashing
      })
    );
  }

  // --- 🔥 Get recommendations from OpenLibrary directly ---
  getOpenLibraryRecommendations(
    query: string,
    limit: number = 10
  ): Observable<ExternalBook[]> {
    // ✅ Optimized request: fetch only necessary fields
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i`;
    console.log('🌐 Fetching from OpenLibrary:', url);

    return this.http.get<any>(url).pipe(
      map(res => {
        if (!res || !Array.isArray(res.docs)) {
          console.warn('⚠️ Unexpected OpenLibrary response format:', res);
          return [];
        }

        const mapped: ExternalBook[] = res.docs
          .filter((doc: any) => doc && doc.title) // only valid entries
          .slice(0, limit)                        // enforce limit
          .map((doc: any) => ({
            workKey: doc.key,
            title: doc.title,
            authorName: doc.author_name?.[0] || 'Unknown',
            firstPublishYear: doc.first_publish_year,
            coverUrl: doc.cover_i
              ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
              : null,
            openLibraryUrl: `https://openlibrary.org${doc.key}`
          }));

        console.log(`✅ OpenLibrary returned ${mapped.length} books`);
        return mapped;
      }),
      catchError(err => {
        console.error('❌ OpenLibrary request failed:', err);
        return of([]); // return empty array on error
      })
    );
  }
}
